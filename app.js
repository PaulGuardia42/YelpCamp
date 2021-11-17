const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

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

// testing

// set up ejs template engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// find out what this does! (yelp camp class - 410)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'thisisasecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// initalize passport with this middleware
app.use(passport.initialize());
// need this middle ware for persistant signin sessions
// make sure to use app.use(session(sessionConfig)); before this one:
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


// how to store a user and "un" store a user from a session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/fakeUser', async (req, res) => {
  const user = new User({ email: 'paulg@gmail.com', username: 'Paulg' });
  const newUser = await User.register(user, 'chicken');
  res.send(newUser);
})

//rendering the ejs home page as the root (/)
app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh no, Something went wrong!';
  res.status(statusCode).render('error', { err });
});

// Setting up the app to serve on local host port 3000
app.listen(3000, () => {
  console.log('Serving on port 3000');
});
