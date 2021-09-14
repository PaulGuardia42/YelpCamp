const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

// store express() function in a variable called app
const app = express();

// set up ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// find out what this does! (yelp camp class - 410)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//rendering the ejs home page as the root (/)
app.get('/', (req, res) => {
  res.render('home');
});

// rendering campgrounds through the index.ejs file within the campgrounds directory
app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

// using this to create your own campground
app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

// rendering the ejs file show, which will show each campground
app.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/show', { campground });
});

// route that serves the form
app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
  //destructure id
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
});

// Setting up the app to serve on local host port 3000
app.listen(3000, () => {
  console.log('Serving on port 3000');
});
