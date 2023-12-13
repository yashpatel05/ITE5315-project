/****************************************************************************** 
 * ITE5315 – Project 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * No part of this assignment has been copied manually or electronically from any other source 
 * (including web sites) or distributed to other students. 
 * 
 * Group member Name: Yash Patel     Student IDs: N01537676    Date: 12/12/23
 *                    Aditya Joshi                N01545536
 ******************************************************************************/

// load mongoose since we need it to define a model
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const jwtuserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Users = mongoose.model('Users', jwtuserSchema);
module.exports = Users;