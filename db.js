/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Yash Patel     Student IDs: N01537676    Date: 12/12/23
 *                    Aditya Joshi                N01545536
 ******************************************************************************/

require('dotenv').config(); // Load environment variables from .env file

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Restaurant = require('./models/restaurant');
const Users = require('./models/users');

const dbUrl = process.env.DB_URL;

module.exports = {
    // Function to initialize the MongoDB connection
    initialize: async () => {
        try {
            // Connect to MongoDB using the provided connection string
            await mongoose.connect(dbUrl, {
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
            // Function to generate random coordinates within a range
            const getRandomCoordinate = () => {
                const min = -90;
                const max = 90;
                const randomLatitude = Math.random() * (max - min) + min;
                const randomLongitude = Math.random() * (max - min) + min;
                return [randomLongitude, randomLatitude];
            };

            // Format the input data to match the desired structure
            const formattedData = {
                address: {
                    building: data.building,
                    coord: getRandomCoordinate(),
                    street: data.street,
                    zipcode: data.zipcode,
                },
                borough: data.borough,
                cuisine: data.cuisine,
                grades: [], // Initialize grades as an empty array
                name: data.name,
                restaurant_id: data.restaurant_id,
            };

            // Loop through the grade entries in the form
            for (let i = 0; i < data.grades.grade.length; i++) {
                // Check if both grade and score are present for the entry
                if (data.grades.grade[i] && data.grades.score[i]) {
                    formattedData.grades.push({
                        date: new Date().toISOString(), // Use current date for the example
                        grade: data.grades.grade[i],
                        score: data.grades.score[i],
                    });
                }
            }

            // Create a new instance of the Restaurant model with the formatted data
            const newRestaurant = new Restaurant(formattedData);

            // Save the new restaurant to the database
            const result = await newRestaurant.save();

            // Return the newly created restaurant
            return { success: true, message: 'Restaurant added successfully', result };
        } catch (error) {
            // Log and throw an error if adding new restaurant fails
            console.error(`Error adding new restaurant: ${error.message}`);
            throw { success: false, message: 'Error adding new restaurant' };
        }
    },

    // Function to get a paginated list of restaurants with optional borough filter
    getAllRestaurantsByPage: async (page, perPage, borough) => {
        try {
            // Construct a query based on the optional borough filter
            const query = borough ? { 'borough': borough } : {};
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

    authenticateUser: async (username, password) => {
        try {
            const user = await Users.findOne({ username });

            if (!user) {
                return { success: false, message: 'Username or password is incorrect' };
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return { success: false, message: 'Invalid login credentials' };
            }

            return { success: true, user };
        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, message: 'Error during login' };
        }
    },

    registerUser: async (username, password) => {
        try {
            // Check if the user already exists
            const existingUser = await Users.findOne({ username }).exec();
            if (existingUser) {
                return { success: false, message: 'User already exists' };
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user instance
            const user = new Users({
                username,
                password: hashedPassword
            });

            // Save the user to the database
            await user.save();

            return { success: true, message: 'User created successfully' };
        } catch (error) {
            return { success: false, message: 'Error registering new user' };
        }
    },

    searchRestaurantsByName: async (restaurantName) => {
        try {
            // Use a regular expression to perform a case-insensitive partial string match
            const regex = new RegExp(restaurantName, 'i');

            // Use Mongoose to find restaurants that match the partial search query
            const searchResults = await Restaurant.find({ name: regex })
                .collation({ locale: 'en', strength: 2 }) // Enable case-insensitive sorting
                .sort({ name: 1 }); // Sort results by restaurant name in ascending order

            return searchResults;
        } catch (error) {
            console.error(`Error searching for restaurants by name: ${error.message}`);
            throw error; // Propagate the error to the calling function
        }
    },
};