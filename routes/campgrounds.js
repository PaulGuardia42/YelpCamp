const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/')
    // rendering campgrounds through the index.ejs file within the campgrounds directory
    .get(catchAsync(campgrounds.index))
    // using this to create your own campground
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    .post(upload.array('image'), (req, res) => {
        console.log(req.body, req.files);
        res.send("It Worked!");
    })
    
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    // rendering the ejs file show, which will show each campground
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


// route that serves the form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
