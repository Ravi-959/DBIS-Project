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

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

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

  console.log("checking logged in");
  
  if (!req.session.userId) {
    return res.status(400).json({ message: "Not logged in" });
  }

  try {
    
    const result = await pool.query("SELECT username FROM users WHERE user_id = $1", [req.session.userId]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Not logged in" });
    }
    res.status(200).json({ message: "Logged in", username: result.rows[0].username,isAuthenticated:true });
    console.log("User Id: $1",[req.session.userId]);
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

app.get('/listings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.listing_id,
        l.name,
        l.description,
        c.name AS category_name,
        s.name AS subcategory_name,
        l.price
      FROM listings l
      JOIN categories c ON l.category_id = c.category_id
      JOIN subcategories s ON l.subcategory_id = s.subcategory_id
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /listings-with-images - Get all listings with their primary image
app.get('/listings-with-images', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.listing_id,
        l.name,
        l.description,
        c.name AS category_name,
        s.name AS subcategory_name,
        l.price,
        li.image_url
      FROM listings l
      JOIN categories c ON l.category_id = c.category_id
      JOIN subcategories s ON l.subcategory_id = s.subcategory_id
      LEFT JOIN (
        SELECT 
          listing_id, 
          image_url,
          ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY is_primary DESC, image_id ASC) as rn
        FROM listing_images
      ) li ON l.listing_id = li.listing_id AND li.rn = 1
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
      productBrand, 
      description, 
      price, 
      contactInfo,
      imageUrls = []
    } = req.body;

    const userId = req.session.userId; // Assuming you have user session

    const listingResult = await pool.query(
      `INSERT INTO listings (
        name, category_id, subcategory_id, user_id, 
        price, description
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING listing_id`,
      [
        productName,
        categoryId,
        subcategoryId,
        userId,
        price,
        description,
      ]
    );

    const listingId = listingResult.rows[0].listing_id

    // Insert image URLs
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

    res.status(201).json({ listingId });
  } catch (error) {

    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});


app.post("/ad-details", async (req, res) => {
  console.log("log in product details");
  console.log(req.body);
  const { listing_id } = req.body;
  try {
    const result = await pool.query(
      `SELECT 
  l.*,
  (
    SELECT image_url 
    FROM listing_images 
    WHERE listing_id = l.listing_id
    ORDER BY is_primary DESC, image_id ASC
    LIMIT 1
  ) AS primary_image_url
FROM listings l
WHERE l.listing_id = $1`
      , [listing_id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product fetched successfully", product: result.rows[0] });

    console.log(result.rows[0]);

  } catch (error) {
    console.error("Error fetching product details", error);
    res.status(500).json({ message: "Error fetching product details" });
  }
});

app.post("/subcategory_name", async (req, res) => {
  console.log("Request for subcategory name");
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
    const result = await pool.query(
      `SELECT 
        l.*,
        li.image_url
      FROM listings l
      LEFT JOIN (
        SELECT 
          listing_id, 
          image_url,
          ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY is_primary DESC, image_id ASC) as rn
        FROM listing_images
      ) li ON l.listing_id = li.listing_id AND li.rn = 1
      WHERE l.category_id = $1 AND subcategory_id = $2`,
      [category_id, subcategory_id]
    );

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
  console.log("Request for products by category");
  console.log(req.body);
  const { category_id } = req.body;
  
  try {
    console.log("Category ID:", category_id); // Debugging line
    const result = await pool.query(`
      SELECT 
        l.*,
        li.image_url
      FROM listings l
      LEFT JOIN (
        SELECT 
          listing_id, 
          image_url,
          ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY is_primary DESC, image_id ASC) as rn
        FROM listing_images
      ) li ON l.listing_id = li.listing_id AND li.rn = 1
      WHERE l.category_id = $1
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
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});