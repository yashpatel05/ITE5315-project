const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLFloat, GraphQLInt } = require('graphql');

const GradeType = new GraphQLObjectType({
    name: 'Grade',
    fields: {
        date: { type: GraphQLString },
        grade: { type: GraphQLString },
        score: { type: GraphQLInt }, // Assuming score is an integer
    },
});

const AddressType = new GraphQLObjectType({
    name: 'Address',
    fields: {
        building: { type: GraphQLString },
        coord: { type: new GraphQLList(GraphQLFloat) }, // Assuming coord is an array of floats
        street: { type: GraphQLString },
        zipcode: { type: GraphQLString },
    },
});

const RestaurantType = new GraphQLObjectType({
    name: 'Restaurant',
    fields: {
        address: { type: AddressType },
        borough: { type: GraphQLString },
        cuisine: { type: GraphQLString },
        grades: { type: new GraphQLList(GradeType) },
        name: { type: GraphQLString },
        restaurant_id: { type: GraphQLString },
    },
});

module.exports = RestaurantType;