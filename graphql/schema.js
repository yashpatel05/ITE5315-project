const { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLString } = require('graphql');
const RestaurantType = require('./types/RestaurantType');
const db = require('../db');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    restaurants: {
      type: new GraphQLList(RestaurantType),
      resolve(_, args, context) {
        // Use the context or any other parameters as needed
        return db.getAllRestaurantsByPage(1, 5, 'Brooklyn'); // Modify as needed
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});