const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dbis_olx',
  password: 'Kishore@11',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '..\\images')));

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

////////////////////////////////////////////////////
// Login, Signup and Authentication

function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  else{
    next();
  }
}

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if email is already registered
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Error: Email is already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const insertQuery = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id';
    const insertResult = await pool.query(insertQuery, [username, email, hashedPassword]);

    // Store userId in session
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    req.session.userId = user.user_id;
    req.session.user = {username: user.username, id: user.user_id, email: user.email };

    // Return success response
    res.status(200).json({ message: 'User Registered Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error signing up' });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Store userId in session
    req.session.userId = user.user_id;

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

app.get("/isLoggedIn", async (req, res) => {

  // console.log("checking logged in");
  
  if (!req.session.userId) {
    return res.status(400).json({ message: "Not logged in" });
  }

  try {
    
    const result = await pool.query("SELECT username FROM users WHERE user_id = $1", [req.session.userId]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Not logged in" });
    }
    const user_id = req.session.userId;
    res.status(200).json({ message: "Logged in", username: result.rows[0].username,isAuthenticated:true, user_id : user_id });
    // console.log("User Id: $1",[req.session.userId]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking login status" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});


////////////////////////////////////////////////////
// Filterbar, Navbar - Names, Attributes of Category and Subcategory

app.get('/categories-with-subcategories', async (req, res) => {
  try {
    // Get all categories
    const categories = await pool.query('SELECT * FROM categories');
    
    // For each category, get its subcategories
    const categoriesWithSubcategories = await Promise.all(
      categories.rows.map(async (category) => {
        const subcategories = await pool.query(
          'SELECT * FROM subcategories WHERE category_id = $1',
          [category.category_id]
        );
        return {
          ...category,
          subcategories: subcategories.rows
        };
      })
    );

    res.json(categoriesWithSubcategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const result = await pool.query(
      'SELECT * FROM subcategories WHERE category_id = $1 ORDER BY name',
      [categoryId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get attributes for a category
app.get('/categories/:id/attributes', async (req, res) => {
  try {
      const { id } = req.params;
      
      // Get category attributes with options for enum types
      const attributesQuery = `
          SELECT 
              a.attribute_id, 
              a.name, 
              a.data_type,
              ca.is_required,
              ca.display_order,
              (
                  SELECT json_agg(ao.value ORDER BY ao.value)
                  FROM attribute_options ao
                  WHERE ao.attribute_id = a.attribute_id
              ) AS options
          FROM category_attributes ca
          JOIN attributes a ON ca.attribute_id = a.attribute_id
          WHERE ca.category_id = $1
          ORDER BY ca.display_order
      `;
      
      const { rows } = await pool.query(attributesQuery, [id]);
      
      res.json(rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

app.get('/subcategories/:id/attributes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the subcategory to find its parent category
    const subcategoryQuery = 'SELECT category_id FROM subcategories WHERE subcategory_id = $1';
    const subcategoryResult = await pool.query(subcategoryQuery, [id]);
    
    if (subcategoryResult.rows.length === 0) {
      return res.status(404).send('Subcategory not found');
    }
    
    const categoryId = subcategoryResult.rows[0].category_id;
    
    // Get attributes from both category and subcategory
    const attributesQuery = `
      WITH category_attrs AS (
        SELECT 
          a.attribute_id, 
          a.name, 
          a.data_type,
          ca.is_required,
          ca.display_order,
          (
            SELECT json_agg(ao.value ORDER BY ao.value)
            FROM attribute_options ao
            WHERE ao.attribute_id = a.attribute_id
          ) AS options,
          'category' AS source
        FROM category_attributes ca
        JOIN attributes a ON ca.attribute_id = a.attribute_id
        WHERE ca.category_id = $1
      ),
      subcategory_attrs AS (
        SELECT 
          a.attribute_id, 
          a.name, 
          a.data_type,
          ca.is_required,
          ca.display_order,
          (
            SELECT json_agg(ao.value ORDER BY ao.value)
            FROM attribute_options ao
            WHERE ao.attribute_id = a.attribute_id
          ) AS options,
          'subcategory' AS source
        FROM category_attributes ca
        JOIN attributes a ON ca.attribute_id = a.attribute_id
        WHERE ca.subcategory_id = $2
      ),
      combined_attrs AS (
        -- Get all attributes from both sources
        SELECT * FROM category_attrs
        UNION ALL
        SELECT * FROM subcategory_attrs
      )
      SELECT 
        attribute_id, 
        name, 
        data_type,
        is_required,
        display_order,
        options
      FROM (
        SELECT 
          *,
          ROW_NUMBER() OVER (
            PARTITION BY attribute_id 
            ORDER BY CASE WHEN source = 'subcategory' THEN 0 ELSE 1 END
          ) AS rn
        FROM combined_attrs
      ) ranked_attrs
      WHERE rn = 1  -- Take only one row per attribute (prefer subcategory)
      ORDER BY display_order
    `;
    
    const { rows } = await pool.query(attributesQuery, [categoryId, id]);
    
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


////////////////////////////////////////////////////
// Dash-board and Sell - Listings/Ads  

app.get('/listings-with-images', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH ranked_attributes AS (
        SELECT 
          la.listing_id,
          a.name AS attribute_name,
          CASE 
            WHEN la.number_value IS NOT NULL THEN la.number_value::TEXT
            WHEN o.value IS NOT NULL THEN o.value
            ELSE NULL
          END AS value,
          ROW_NUMBER() OVER (PARTITION BY la.listing_id ORDER BY la.listing_attribute_id) AS rn
        FROM listing_attributes la
        JOIN attributes a ON la.attribute_id = a.attribute_id
        LEFT JOIN attribute_options o ON la.option_id = o.option_id
      ),
      top3_attributes AS (
        SELECT listing_id, attribute_name, value
        FROM ranked_attributes
        WHERE rn <= 3
      )
    
      SELECT 
        l.*,
        li.image_url,
        COALESCE(json_agg(jsonb_build_object(
          'name', t.attribute_name,
          'value', t.value
        )) FILTER (WHERE t.attribute_name IS NOT NULL), '[]') AS attributes
      FROM listings l
      LEFT JOIN (
        SELECT 
          listing_id, 
          image_url,
          ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY is_primary DESC, image_id ASC) AS rn
        FROM listing_images
      ) li ON l.listing_id = li.listing_id AND li.rn = 1
      LEFT JOIN top3_attributes t ON l.listing_id = t.listing_id
      GROUP BY l.listing_id, li.image_url
      ORDER BY l.listing_id
    `);
    
    // Group images with their listings
    const listingsWithImages = result.rows.map(row => ({
      ...row,
      images: row.image_url ? [{ image_url: row.image_url }] : []
    }));
    
    res.json(listingsWithImages);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});


app.post('/listings', async (req, res) => {
  try {
    const { 
        categoryId, 
        subcategoryId, 
        productName, 
        description, 
        price, 
        contactInfo, 
        imageUrls,
        attributes 
    } = req.body;
    
    const userId = req.session.userId;
      
    // 1. Insert the main listing
    const listingQuery = `
        INSERT INTO listings (
            name, 
            category_id, 
            subcategory_id, 
            user_id, 
            price, 
            description
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING listing_id
    `;
    
    const listingValues = [
        productName,
        categoryId,
        subcategoryId,
        userId,
        price,
        description
      ];
    
    const listingResult = await pool.query(listingQuery, listingValues);
    const listingId = listingResult.rows[0].listing_id;
    
    // 2. Insert images
    if (imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        if (url && url.trim() !== '') {
          await pool.query(
            `INSERT INTO listing_images (
              listing_id, 
              image_url, 
              is_primary
            ) VALUES ($1, $2, $3)`,
            [listingId, url.trim(), i === 0] // First image is primary
          );
        }
      }
    }
    
    // 3. Insert attributes
    if (attributes && Object.keys(attributes).length > 0) {
        const attributeEntries = Object.entries(attributes);
        
        for (const [attributeId, value] of attributeEntries) {
            // Determine which column to use based on attribute type
            const attributeTypeQuery = 'SELECT data_type FROM attributes WHERE attribute_id = $1';
            const { rows: [attr] } = await pool.query(attributeTypeQuery, [attributeId]);
            
            let column;
            let normalizedValue = value;
            
            if (attr.data_type === 'number') {
                column = 'number_value';
                normalizedValue = parseFloat(value);
            } 
            else if (attr.data_type === 'enum') {
                column = 'option_id';
                // Get option_id for the selected value
                const optionQuery = 'SELECT option_id FROM attribute_options WHERE attribute_id = $1 AND value = $2';
                const { rows: [option] } = await pool.query(optionQuery, [attributeId, value]);
                normalizedValue = option?.option_id;
            }
            
            if (normalizedValue !== null && normalizedValue !== undefined) {
                const insertAttrQuery = `
                    INSERT INTO listing_attributes (
                        listing_id, 
                        attribute_id, 
                        ${column}
                    ) VALUES ($1, $2, $3)
                `;
                await pool.query(insertAttrQuery, [listingId, attributeId, normalizedValue]);
            }
        }
    }    
    res.status(201).json({ listingId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


////////////////////////////////////////////////////
// Complete details of an Ad/listing

app.post("/ad-details", async (req, res) => {
  const { listing_id } = req.body;
  
  try {
    // Get listing details with primary image
    const listingQuery = `
      SELECT 
        l.*,
        c.name AS category_name,
        s.name AS subcategory_name,
        (
          SELECT image_url 
          FROM listing_images 
          WHERE listing_id = l.listing_id
          ORDER BY is_primary DESC, image_id ASC
          LIMIT 1
        ) AS primary_image_url
      FROM listings l
      JOIN categories c ON l.category_id = c.category_id
      JOIN subcategories s ON l.subcategory_id = s.subcategory_id
      WHERE l.listing_id = $1
    `;

    // Get all attributes for the listing
    const attributesQuery = `
      SELECT 
        a.attribute_id,
        a.name AS attribute_name,
        a.data_type,
        la.number_value,
        ao.value AS option_value
      FROM listing_attributes la
      JOIN attributes a ON la.attribute_id = a.attribute_id
      LEFT JOIN attribute_options ao ON la.option_id = ao.option_id
      WHERE la.listing_id = $1
      ORDER BY a.name
    `;

    // Execute both queries in parallel
    const [listingResult, attributesResult] = await Promise.all([
      pool.query(listingQuery, [listing_id]),
      pool.query(attributesQuery, [listing_id])
    ]);

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const response = {
      product: listingResult.rows[0],
      attributes: attributesResult.rows
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Error fetching product details" });
  }
});


////////////////////////////////////////////////////
// Filterings - Filter on cateogry and subcategory

app.post("/category_name", async (req, res) => {
  console.log("Request for category name");
  const { category_id} = req.body;
  
  try {
    const result = await pool.query(
      "SELECT name FROM categories WHERE category_id = $1", 
      [category_id]  // Corrected parameter array
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "category not found" });
    }
    
    res.status(200).json({ name: result.rows[0].name });
  } catch (error) {
    console.error("Error fetching subcategory name", error);
    res.status(500).json({ 
      message: "Error fetching subcategory name",
      error: error.message 
    });
  }
});

app.post("/subcategory_name", async (req, res) => {
  // console.log("Request for subcategory name");
  const { category_id, subcategory_id } = req.body;
  
  try {
    const result = await pool.query(
      "SELECT name FROM Subcategories WHERE category_id = $1 AND subcategory_id = $2", 
      [category_id, subcategory_id]  // Corrected parameter array
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    
    res.status(200).json({ name: result.rows[0].name });
  } catch (error) {
    console.error("Error fetching subcategory name", error);
    res.status(500).json({ 
      message: "Error fetching subcategory name",
      error: error.message 
    });
  }
});

app.post("/products_by_subcategory", async (req, res) => {
  const { category_id, subcategory_id } = req.body;
  try {
    const result = await pool.query(`
      WITH ranked_attributes AS (
        SELECT 
          la.listing_id,
          a.name AS attribute_name,
          CASE 
            WHEN la.number_value IS NOT NULL THEN la.number_value::TEXT
            WHEN o.value IS NOT NULL THEN o.value
            ELSE NULL
          END AS value,
          ROW_NUMBER() OVER (PARTITION BY la.listing_id ORDER BY la.listing_attribute_id) AS rn
        FROM listing_attributes la
        JOIN attributes a ON la.attribute_id = a.attribute_id
        LEFT JOIN attribute_options o ON la.option_id = o.option_id
      ),
      top3_attributes AS (
        SELECT listing_id, attribute_name, value
        FROM ranked_attributes
        WHERE rn <= 3
      )
    
      SELECT 
        l.*,
        li.image_url,
        COALESCE(json_agg(jsonb_build_object(
          'name', t.attribute_name,
          'value', t.value
        )) FILTER (WHERE t.attribute_name IS NOT NULL), '[]') AS attributes
      FROM listings l
      LEFT JOIN (
        SELECT 
          listing_id, 
          image_url,
          ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY is_primary DESC, image_id ASC) AS rn
        FROM listing_images
      ) li ON l.listing_id = li.listing_id AND li.rn = 1
      LEFT JOIN top3_attributes t ON l.listing_id = t.listing_id
      WHERE l.category_id = $1 AND l.subcategory_id = $2
      GROUP BY l.listing_id, li.image_url
    `, [category_id, subcategory_id]);

      // Group images with their listings
      const listingsWithImages = result.rows.map(row => ({
        ...row,
        images: row.image_url ? [{ image_url: row.image_url }] : []
      }));

    res.status(200).json({ products: listingsWithImages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching subcategory products" });
  }
});

app.post("/products_by_category", async (req, res) => {
  // console.log("Request for products by category");
  // console.log(req.body);
  const { category_id } = req.body;
  
  try {

    const result = await pool.query(`
      WITH ranked_attributes AS (
        SELECT 
          la.listing_id,
          a.name AS attribute_name,
          CASE 
            WHEN la.number_value IS NOT NULL THEN la.number_value::TEXT
            WHEN o.value IS NOT NULL THEN o.value
            ELSE NULL
          END AS value,
          ROW_NUMBER() OVER (PARTITION BY la.listing_id ORDER BY la.listing_attribute_id) AS rn
        FROM listing_attributes la
        JOIN attributes a ON la.attribute_id = a.attribute_id
        LEFT JOIN attribute_options o ON la.option_id = o.option_id
      ),
      top3_attributes AS (
        SELECT listing_id, attribute_name, value
        FROM ranked_attributes
        WHERE rn <= 3
      )
    
      SELECT 
        l.*,
        li.image_url,
        COALESCE(json_agg(jsonb_build_object(
          'name', t.attribute_name,
          'value', t.value
        )) FILTER (WHERE t.attribute_name IS NOT NULL), '[]') AS attributes
      FROM listings l
      LEFT JOIN (
        SELECT 
          listing_id, 
          image_url,
          ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY is_primary DESC, image_id ASC) AS rn
        FROM listing_images
      ) li ON l.listing_id = li.listing_id AND li.rn = 1
      LEFT JOIN top3_attributes t ON l.listing_id = t.listing_id
      WHERE l.category_id = $1
      GROUP BY l.listing_id, li.image_url
    `, [category_id]);
    
    
    // Group images with their listings
    const listingsWithImages = result.rows.map(row => ({
      ...row,
      images: row.image_url ? [{ image_url: row.image_url }] : []
    }));

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: "No products found in this category",
        products: [] 
      });
    }
    
    res.status(200).json({ 
      message: "Products fetched successfully", 
      products: listingsWithImages  // Changed to match frontend expectation
    });

  } catch (error) {
    console.error("Error fetching products by category", error);
    res.status(500).json({ 
      message: "Error fetching products by category" 
    });
  }
});


////////////////////////////////////////////////////
// Contact Seller - Messages and Conversations

app.post("/conversations", async (req, res) => {
  const { buyer_id, seller_id, listing_id } = req.body;

  try {
    // Check if conversation already exists
    const existing = await pool.query(
      `SELECT * FROM Conversations WHERE buyer_id = $1 AND seller_id = $2 AND listing_id = $3`,
      [buyer_id, seller_id, listing_id]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ conversation: existing.rows[0] });
    }
    console.log("Oy there mate");
  
    // Create new conversation
    const result = await pool.query(
      `INSERT INTO Conversations (buyer_id, seller_id, listing_id) VALUES ($1, $2, $3) RETURNING *`,
      [buyer_id, seller_id, listing_id]
    );
    res.status(201).json({ conversation: result.rows[0] });

  }
  catch(err){
    console.error(err);
    res.status(500).json({ error: "Error creating conversation" });
  }
});

// ✅ Fetch all conversations for a user (uses :userId param)
app.get("/conversations/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query(
      `SELECT c.*, u.username AS buyer_name, u2.username AS seller_name, l.name AS listing_name
       FROM Conversations c
       JOIN Users u ON c.buyer_id = u.user_id
       JOIN Users u2 ON c.seller_id = u2.user_id
       JOIN Listings l ON c.listing_id = l.listing_id
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    console.log("Oy there mate");
    console.log(result.rows[0]);  // Log newly created conversation

    res.status(200).json({ conversations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching conversations" });
  }
});

// Send a message
app.post("/messages", async (req, res) => {
  const { conversation_id, sender_id, message_text } = req.body;

  try {
    // Get the conversation to determine receiver
    const convo = await pool.query(
      `SELECT buyer_id, seller_id FROM Conversations WHERE conversation_id = $1`,
      [conversation_id]
    );

    if (convo.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const { buyer_id, seller_id } = convo.rows[0];
    const receiver_id = sender_id === buyer_id ? seller_id : buyer_id;

    const result = await pool.query(
      `INSERT INTO Messages (conversation_id, sender_id, receiver_id, message_text)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [conversation_id, sender_id, receiver_id, message_text]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending message" });
  }
});

// Get messages for a conversation
app.get("/messages/:conversation_id", async (req, res) => {
  const { conversation_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, u.username FROM Messages m JOIN Users u ON m.sender_id = u.user_id
       WHERE m.conversation_id = $1 ORDER BY m.sent_at ASC`,
      [conversation_id]
    );

    res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.post("/check-or-create-conversation", async (req, res) => {
  const { user_id_1, user_id_2 } = req.body; // user_id_1 should be the buyer, user_id_2 should be the seller

  console.log("Received request:", { user_id_1, user_id_2 });

  try {
    // Validate if user IDs are present
    if (!user_id_1 || !user_id_2) {
      return res.status(400).json({ message: "Missing user IDs" });
    }

    // Query to check if a conversation already exists between the buyer and seller
    const result = await pool.query(
      "SELECT * FROM conversations WHERE (buyer_id = $1 AND seller_id = $2) OR (buyer_id = $2 AND seller_id = $1)",
      [user_id_1, user_id_2]
    );

    if (result.rows.length > 0) {
      // If conversation exists, return the conversation_id
      console.log("Conversation found:", result.rows[0].conversation_id);
      return res.status(200).json({
        conversation_id: result.rows[0].conversation_id,
        other_user_id: user_id_2,
        other_username: "Some Username", // Fetch the actual username from the users table if needed
      });
    } else {
      // If no conversation exists, create a new one
      const insertResult = await pool.query(
        "INSERT INTO conversations (buyer_id, seller_id, listing_id) VALUES ($1, $2, $3) RETURNING conversation_id",
        [user_id_1, user_id_2, 1] // Assuming `listing_id` is 1 for now, replace it with actual listing_id
      );

      console.log("Created new conversation:", insertResult.rows[0].conversation_id);

      return res.status(200).json({
        conversation_id: insertResult.rows[0].conversation_id,
        other_user_id: user_id_2,
        other_username: "Some Username", // Fetch from DB
      });
    }
  } catch (error) {
    console.error("Error in /check-or-create-conversation:", error);
    return res.status(500).json({ message: "Server error", details: error.message });
  }
});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});