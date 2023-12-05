/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Yash Patel     Student IDs: N01537676    Date: 04/12/23
 *                    Aditya Joshi                N01545536
 ******************************************************************************/

const mongoose = require('mongoose');
const Restaurant = require('./models/restaurant');
const database = require('./config/database');

module.exports = {
    // Function to initialize the MongoDB connection
    initialize: async () => {
        try {
            // Connect to MongoDB using the provided connection string
            await mongoose.connect(database.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            // Log and throw an error if connection fails
            console.error(`Error connecting to MongoDB: ${error.message}`);
            throw error;
        }
    },

    // Function to add a new restaurant to the database
    addNewRestaurant: async (data) => {
        try {
            // Create a new instance of the Restaurant model with the provided data
            const newRestaurant = new Restaurant(data);
            // Save the new restaurant to the database
            const result = await newRestaurant.save();
            return result;
        } catch (error) {
            // Log and throw an error if adding new restaurant fails
            console.error(`Error adding new restaurant: ${error.message}`);
            throw error;
        }
    },

    // Function to get a paginated list of restaurants with optional borough filter
    getAllRestaurants: async (page, perPage, borough) => {
        try {
            // Construct a query based on the optional borough filter
            const query = borough ? { 'address.borough': borough } : {};
            // Retrieve a paginated list of restaurants based on the query
            const result = await Restaurant.find(query)
                .sort({ 'restaurant_id': 1 })
                .skip((page - 1) * perPage)
                .limit(perPage);
            return result;
        } catch (error) {
            // Log and throw an error if getting all restaurants fails
            console.error(`Error getting all restaurants by page, perPage, and borough: ${error.message}`);
            throw error;
        }
    },

    // Function to get a restaurant by its unique ID
    getRestaurantById: async (id) => {
        try {
            // Retrieve a restaurant by its unique ID
            const result = await Restaurant.findById(id);
            return result;
        } catch (error) {
            // Log and throw an error if getting a restaurant by ID fails
            console.error(`Error getting restaurant by ID: ${error.message}`);
            throw error;
        }
    },

    // Function to update a restaurant by its unique ID
    updateRestaurantById: async (data, id) => {
        try {
            // Update a restaurant by its unique ID with the provided data
            const result = await Restaurant.findByIdAndUpdate(id, data, {
                new: true, // Return the updated document
                runValidators: true, // Run validation on the updated data
            });
            return result;
        } catch (error) {
            // Log and throw an error if updating a restaurant by ID fails
            console.error(`Error updating restaurant by ID: ${error.message}`);
            throw error;
        }
    },

    // Function to delete a restaurant by its unique ID
    deleteRestaurantById: async (id) => {
        try {
            // Delete a restaurant by its unique ID
            const result = await Restaurant.findByIdAndDelete(id);
            return result;
        } catch (error) {
            // Log and throw an error if deleting a restaurant by ID fails
            console.error(`Error deleting restaurant by ID: ${error.message}`);
            throw error;
        }
    },
};