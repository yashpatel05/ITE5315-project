var express  = require('express');
var path = require('path');
var mongoose = require('mongoose');
var app      = express();
var exphbs = require('express-handlebars');
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
 
var port     = process.env.PORT || 8000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

mongoose.connect(database.url);

var Car = require('./models/car');

// Set the view engine to use Handlebars
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    helpers:{ 
        
      } 
}));
app.set('view engine', 'hbs');

// Show all invoice-info
app.get('/api/cars', function (req, res) {
    Car.find(function (err, cars) {
        if (err)
            res.send(err)

        // Convert Mongoose documents to plain JavaScript objects
        const parsedCars = cars.map(car => car.toObject());

        // Render the 'allData' view and pass the parsed JSON data to it
        res.render('allData', { salesData: parsedCars, title: 'All Sales Info' });  
    });
});

// Show a specific invoice (based on the _id or invoiceID)
app.get('/api/cars/:car_id', function (req, res) {
    let id = req.params.car_id;
    Car.findById(id, function (err, car) {
        if (err)
            res.send(err)
        res.json(car);
    });
});

// Show form to insert a new invoice
app.get('/addData', function (req, res) {
    res.render('addData', { title: 'Add New Data' });
});

// Insert a new invoice
app.post('/api/cars', function (req, res) {
    Car.create({
        InvoiceNo: req.body.InvoiceNo,
        image: req.body.image,
        Manufacturer: req.body.Manufacturer,
        class: req.body.class,
        Sales_in_thousands: req.body.Sales_in_thousands,
        __year_resale_value: req.body.__year_resale_value,
        Vehicle_type: req.body.Vehicle_type,
        Price_in_thousands: req.body.Price_in_thousands,
        Engine_size: req.body.Engine_size,
        Horsepower: req.body.Horsepower,
        Wheelbase: req.body.Wheelbase,
        Width: req.body.Width,
        Length: req.body.Length,
        Curb_weight: req.body.Curb_weight,
        Fuel_capacity: req.body.Fuel_capacity,
        Fuel_efficiency: req.body.Fuel_efficiency,
        Latest_Launch: req.body.Latest_Launch,
        Power_perf_factor: req.body.Power_perf_factor
    }, function (err, car) {
        if (err)
            res.send(err);
        Car.find(function (err, cars) {
            if (err)
                res.send(err)

            // Convert Mongoose documents to plain JavaScript objects
            const parsedCars = cars.map(car => car.toObject());

            // Render the 'allData' view and pass the parsed JSON data to it
            res.render('allData', { salesData: parsedCars, title: 'All Sales Info' });
        });
    });
});

// Delete an existing invoice (based on the _id or invoiceID)
app.delete('/api/cars/:car_id', function (req, res) {
    let id = req.params.car_id;
    Car.remove({
        _id: id
    }, function (err) {
        if (err)
            res.send(err);
        else
            res.send('Successfully! CarSales record deleted.');
    });
});

// Update "Manufacturer" & “price_in_thousands” of an existing invoice (based on the _id or invoiceID)
app.put('/api/cars/:car_id', function (req, res) {
    let id = req.params.car_id;
    var data = {
        Manufacturer: req.body.Manufacturer,
        Price_in_thousands: req.body.Price_in_thousands,
    }

    Car.findByIdAndUpdate(id, data, function (err, car) {
        if (err) throw err;
        res.send('Successfully! CarSales record updated.');
    });
});

// Added new functionality

// Define a route to display the search form for Manufacturer
app.get('/search/manufacturer', (req, res) => {
  res.render('search_manufacturer', { title: 'Search for Manufacturer' });
});

// Handle the form submission for Manufacturer search
app.post('/search/manufacturerResult', async (req, res) => {
  try {
    const searchManufacturer = req.body.manufacturer.toLowerCase();

    // Use Mongoose to find documents that match the search criteria
    const results = await Car.find({
      Manufacturer: { $regex: new RegExp(searchManufacturer, 'i') }, // Case-insensitive search
    });

    if (results.length > 0) {
      res.render('search_manufacturer_result', {
        title: 'Search Manufacturer Results',
        searchManufacturer: searchManufacturer,
        results: results.map(result => result.toObject()), // Convert Mongoose documents to plain JavaScript objects
      });
    } else {
      res.render('error', {
        title: 'Error',
        message: `No sales records found for "${searchManufacturer}" Manufacturer.`,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port);
console.log("App listening on port : " + port);