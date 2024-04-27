const express = require("express");
require('dotenv').config();
const axios = require('axios');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

// Use cors middleware to allow CORS on all sites.
app.use(cors());

console.log(process.env.URI);
mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Plates', // Specify the database name
});

// Define schema for the collection
const plateSchema = new mongoose.Schema({}, { collection: 'New plates' });
const otherSchema = new mongoose.Schema({}, { collection: 'Plates' }); // Define schema for the other collection

// Define model for the collection
const Plate = mongoose.model('Plate', plateSchema);
const OtherPlate = mongoose.model('PlateTwo', otherSchema); // Define model for the other collection

// Create an Axios instance with increased timeout
const axiosInstance = axios.create({
  timeout: 300000, // 10 seconds timeout
});

app.get("/", (req, res) => {
  const date = req.query.date;
  console.log(date);
  var options = {
    method: 'GET',
    url: `https://dvlaregistrations.dvla.gov.uk/api/updates/from/${date}/format/json`,
    headers: {
      'X-API-KEY': 'w8c8o00s84c08k08ws80gss8wgowwo804okk8884'
    }
  };

  // Use the axiosInstance instead of axios
  axiosInstance.request(options)
    .then(function (response) {
      // Send the API response data back to the client as JSON
      res.status(200).json({
        data: response.data,
        message: "success"
      });
    })
    .catch(function (error) {
      // Send the error response to the client
      console.error(error);
      res.status(400).json({
        data: [],
        message: "error"
      });
    });
});

// New endpoint to interact with the other collection
app.get("/plates", async (req, res) => {
  try {
    const searchLetters = req.query.letters;

    const searchPattern = new RegExp(searchLetters, 'i');
    console.log(searchPattern);
    const otherPlates = await OtherPlate.find({ letters: searchPattern });

    res.status(200).json({
      data: otherPlates,
      message: "success"
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      data: [],
      message: "error"
    });
  }
});

app.get("/new-plates", async (req, res) => {
  try {
    const searchLetters = req.query.letters;

    const searchPattern = new RegExp(searchLetters, 'i');
    console.log(searchPattern);

    const plates = await Plate.find({ letters: searchPattern })

    res.status(200).json({
      data: plates,
      message: "success"
    })
  } catch (error) {
    console.error(error);
    res.status(400).json({
      data: [],
      message: "error"
    });
  }
});


app.listen(5000, () => {
  console.log("Running on port 5000.");
});

// Export the Express API
module.exports = app;
