# Restaurant Management System using Node.js, Express and MongoDB

## Project Overview

This project focuses on working with sample restaurant data in MongoDB Atlas and implementing various functionalities using Node.js, Express, and MongoDB.

### Step 1: Loading Data

- Loaded the "Sample Restaurant Data" into MongoDB Atlas.

### Step 2: Setting Up Repository and Models

- Set up a new Git repository.
- Created database.js and restaurant.js models.
- Initialized the module before starting the server.

### Step 3: Implementing REST API Endpoints

- Implemented various REST API endpoints for managing restaurant data:
  - POST /api/restaurants: Adds a new restaurant document to the collection.
  - GET /api/restaurants: Returns restaurant objects based on page, perPage, and optional borough filtering. Implemented query param validation for type and presence.
  - GET /api/restaurants/:id: Returns a specific restaurant object based on the _id.
  - PUT /api/restaurants/:id: Updates a specific restaurant based on specified values.
  - DELETE /api/restaurants/:id: Deletes a specific restaurant based on _id.
- Added UI/Form for:
  - Getting restaurant by page, perPage, and borough.
  - Adding restaurant data.
  - Getting restaurant by ID.

### Step 4: Security Measures

- Implemented security measures:
  - Used .env file to hide the database connection string.
  - Encrypted passwords using bcrypt for user authentication.
  - Authorized access to special routes using JWT token.

### Step 5: Additional Functionality

- Added search functionality by restaurant name using partial search and sorted the results by restaurant name.

### Step 6: GraphQL Integration

- Integrated GraphQL for /api/restaurants route to filter results by page, perPage, and borough.
  
### Step 7: Deployment

- Pushed the code to GitHub repository.
- Deployed the app to Cyclic.

## Additional Content and Screenshots

For additional content and screenshots, please refer to the Word document available in the repository [Restaurant-Management-System](https://github.com/yashpatel05/Restaurant-Management-System/blob/master/ITE5315_Project_Yash_Patel.docx).

## Author

**Yash Patel**
