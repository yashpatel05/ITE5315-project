/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Yash Patel     Student IDs: N01537676    Date: 12/12/23
 *                    Aditya Joshi                N01545536
 ******************************************************************************/

const express = require('express');
const { query, validationResult } = require('express-validator');
const cors = require('cors');
const db = require('./db');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const exphbs = require('express-handlebars');
const crypto = require('crypto');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');

const app = express();                                         // Express app setup

const bodyParser = require('body-parser');                     // pull information from HTML POST (express4)

// Define the port for the server
const PORT = process.env.PORT || 8000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());                                                // Enable CORS for all routes                  
app.use(bodyParser.urlencoded({ 'extended': 'true' }));         // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(cookieParser());
// Generate a secure random string for session secret key
const sessionSecretKey = crypto.randomBytes(64).toString('hex');

// Generate a secure random string for JWT secret key
const jwtSecretKey = crypto.randomBytes(64).toString('hex');

// Use the generated keys in your code
app.use(session({
  secret: sessionSecretKey,
  resave: true,
  saveUninitialized: true,
}));

// JWT Secret Key
const JWT_SECRET_KEY = jwtSecretKey;

// Configure the express-handlebars view engine with the '.hbs' file extension
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));

// Set 'hbs' as the default view engine for the application
app.set('view engine', 'hbs');

// Initialize MongoDB connection
db.initialize()
  .then(() => {
    // Start the server after successfully connecting to MongoDB
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Failed to connect to MongoDB: ${err}`);
  });

// Routes

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || '';

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  });
};

app.get('/', function (req, res) {
  res.render('index', { title: 'Login' });
});

app.get('/home', function (req, res) {
  res.render('home', { title: 'Home Page' });
});

// Authentication endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const authResult = await db.authenticateUser(username, password);

    if (!authResult.success) {
      // Redirect to home route and display an alert
      return res.redirect('/?error=' + encodeURIComponent(authResult.message));
    }

    const { user } = authResult;

    // If the password matches, proceed to generate the token
    // Generate JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET_KEY);

    // Set JWT as a cookie
    res.cookie('token', token, { httpOnly: true });

    // Redirect to home route after successful login with a success message
    res.redirect('/home?success=' + encodeURIComponent('Login successful'));
  } catch (error) {
    console.error('Login error:', error);

    // Redirect to home route and display an alert for other errors
    res.redirect('/?error=' + encodeURIComponent('Error during login'));
  }
});

app.get('/api/add-restaurant', (req, res) => {
  res.render('addNewRestaurant'); // Render the addNewRestaurant.hbs file
});

// POST route to add a new restaurant
app.post('/api/restaurants', verifyToken, async (req, res) => {
  try {
    const result = await db.addNewRestaurant(req.body); // Add a new restaurant based on the request body

    // Display an alert for success
    res.redirect('/home?success=' + encodeURIComponent(result.message));
  } catch (error) {
    // Display an alert for error
    res.redirect('/api/add-restaurant?error=' + encodeURIComponent(error.message));
  }
});

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true, // Enable GraphiQL for development
}));

app.get('/get-restaurants-form', verifyToken, (req, res) => {
  res.render('addParameter', { user: req.user }); // Render the addParameter.hbs file
});

// GET route to retrieve a paginated list of restaurants with optional borough filter
app.get('/api/restaurants', verifyToken, [
  query('page').isInt().toInt(),
  query('perPage').isInt().toInt(),
  query('borough').optional().isString(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { page, perPage, borough } = req.query;
      const result = await db.getAllRestaurantsByPage(Number(page), Number(perPage), borough);

      // Convert Mongoose documents to plain JavaScript objects
      const parsedResults = result.map(restaurant => restaurant.toObject());

      res.render('restaurants', { restaurants: parsedResults, title: 'Restaurants by page, perPage & Borough' });
    } catch (error) {
      res.render('error', { error: error.message });
    }
  },
]);

app.get('/searchByID', verifyToken, (req, res) => {
  res.render('searchByID'); // Render the searchByID.hbs file
});

// GET route to retrieve a specific restaurant by ID
app.get('/api/restaurant/:id', verifyToken, async (req, res) => {
  try {
    const fid = req.params.id;

    const result = await db.getRestaurantById(fid);

    // Convert Mongoose document to plain JavaScript object
    const parsedResult = result.toObject();

    res.render('showByID', { restaurant: parsedResult });
  } catch (error) {
    res.status(500).json({ error: error.message }); // Return an error message with status code 500 (Internal Server Error)
  }
});

// PUT route to update a specific restaurant by ID
app.put('/api/restaurants/:id', verifyToken, async (req, res) => {
  try {
    const result = await db.updateRestaurantById(req.body, req.params.id);
    res.json(result); // Return the updated restaurant as JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); // Return an error message with status code 500 (Internal Server Error)
  }
});

// DELETE route to delete a specific restaurant by ID
app.delete('/api/restaurants/:id', verifyToken, async (req, res) => {
  try {
    const result = await db.deleteRestaurantById(req.params.id);
    res.json({ message: 'Restaurant deleted successfully' }); // Return a success message as JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); // Return an error message with status code 500 (Internal Server Error)
  }
});

// Additional Functions included in the application:

// GET route to display the registration form
app.get('/register', (req, res) => {
  res.render('register');
});

// POST route to handle the registration form submission data
app.post('/register', async (req, res) => {
  try {
    // Get username and password from request body
    const { username, password } = req.body;

    // Call the registerUser method from db.js
    const registrationResult = await db.registerUser(username, password);

    // Display an alert for success
    if (registrationResult.success) {
      res.redirect('/?success=' + encodeURIComponent(registrationResult.message));
    } else {
      // Display an alert for error and redirect to /register
      res.redirect('/register?error=' + encodeURIComponent(registrationResult.message));
    }
  } catch (error) {
    // Redirect to /register page in case of 500 error
    res.redirect('/register?error=' + encodeURIComponent('Error registering new user'));
  }
});

// Route to render the search form
app.get('/api/search', verifyToken, (req, res) => {
  res.render('searchByRestaurant'); // Render the searchByRestaurant.hbs template
});

// Route to handle the search request
app.post('/api/search-restaurants', verifyToken, async (req, res) => {
  try {
    const searchQuery = req.body.restaurantName; // Get the search query from the form

    // Call the search function from your db.js module
    const searchResults = await db.searchRestaurantsByName(searchQuery);

    // Convert Mongoose documents to plain JavaScript objects
    const parsedResults = searchResults.map(restaurant => restaurant.toObject());

    // Ensure parsedResults is an array
    const restaurants = Array.isArray(parsedResults) ? parsedResults : [parsedResults];

    // Render the searchString.hbs template with the sorted search results
    res.render('searchRestaurantResult', { restaurants });
  } catch (error) {
    // Handle any errors and return an error response
    console.error(`Error searching for restaurants: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while searching for restaurants' });
  }
});

// Route for handling logout
app.get('/logout', (req, res) => {
  // Clear the JWT token by removing the 'token' cookie
  res.clearCookie('token');

  // Redirect the user to the login page
  res.redirect('/?success=' + encodeURIComponent('You have been successfully logged out.'));
});