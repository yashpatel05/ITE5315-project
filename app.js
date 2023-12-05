/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Yash Patel     Student IDs: N01537676    Date: 04/12/23
 *                    Aditya Joshi                N01545536
 ******************************************************************************/

const express = require('express');
const { query, validationResult } = require('express-validator');
const cors = require('cors');
const db = require('./db');

const app = express();                                         // Express app setup

const bodyParser = require('body-parser');                     // pull information from HTML POST (express4)

// Define the port for the server
const PORT = process.env.PORT || 8000;

app.use(cors());                                                // Enable CORS for all routes                  
app.use(bodyParser.urlencoded({ 'extended': 'true' }));         // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

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

// POST route to add a new restaurant
app.post('/api/restaurants', async (req, res) => {
  try {
    const result = await db.addNewRestaurant(req.body); // Add a new restaurant based on the request body
    res.status(201).json(result); // Return the newly created restaurant with status code 201 (Created)
  } catch (error) {
    res.status(500).json({ error: error.message }); // Return an error message with status code 500 (Internal Server Error)
  }
});

// GET route to retrieve a paginated list of restaurants with optional borough filter
app.get('/api/restaurants', [
  // Validate query parameters using express-validator
  query('page').isInt().toInt(),
  query('perPage').isInt().toInt(),
  query('borough').optional().isString(),

  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return a 400 response if validation fails
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { page, perPage, borough } = req.query;
      const result = await db.getAllRestaurants(Number(page), Number(perPage), borough);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
]);

// GET route to retrieve a specific restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const result = await db.getRestaurantById(req.params.id);
    res.json(result); // Return the specific restaurant as JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); // Return an error message with status code 500 (Internal Server Error)
  }
});

// PUT route to update a specific restaurant by ID
app.put('/api/restaurants/:id', async (req, res) => {
  try {
    const result = await db.updateRestaurantById(req.body, req.params.id);
    res.json(result); // Return the updated restaurant as JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); // Return an error message with status code 500 (Internal Server Error)
  }
});

// DELETE route to delete a specific restaurant by ID
app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    const result = await db.deleteRestaurantById(req.params.id);
    res.json({ message: 'Restaurant deleted successfully' }); // Return a success message as JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); // Return an error message with status code 500 (Internal Server Error)
  }
});