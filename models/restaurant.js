/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Yash Patel     Student IDs: N01537676    Date: 04/12/23
 *                    Aditya Joshi                N01545536
 ******************************************************************************/

// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const GradeSchema = new Schema({
    date: Date,
    grade: String,
    score: Number,
});

const CoordSchema = new Schema({
    0: Number, // longitude
    1: Number, // latitude
});

const AddressSchema = new Schema({
    building: String,
    coord: [CoordSchema],
    street: String,
    zipcode: String,
    borough: String,
});

const RestaurantSchema = new Schema({
    _id: Schema.Types.ObjectId,
    address: AddressSchema,
    cuisine: String,
    grades: [GradeSchema],
    name: String,
    restaurant_id: String,
});

module.exports = mongoose.model('Restaurant', RestaurantSchema, 'restaurants');