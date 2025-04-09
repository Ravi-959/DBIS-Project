const express = require("express");
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

app.post('/listings', async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      productName,
      productBrand,
      description,
      price,
      contactInfo
    } = req.body;

    const userId = req.session.userId; // Assuming you have user session

    const result = await pool.query(
      `INSERT INTO listings (
        name, category_id, subcategory_id, user_id, 
        price, description
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        productName,
        categoryId,
        subcategoryId,
        userId,
        price,
        description,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});