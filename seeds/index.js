// we will only run this file when we want to seed our database or make changes to the database
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// connecting mongoose to our db location
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  // setting up deprecation warinings here
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// connecting mongoose to our db error handling
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      // calling the sample function and feeding in the descriptors and places of the seed helpers
      title: `${sample(descriptors)} ${sample(places)}`,
    });
    await camp.save();
  }
};

// we connect above and then this closes us out
seedDB().then(() => {
  mongoose.connection.close();
});
