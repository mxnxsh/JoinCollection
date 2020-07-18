const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const helpers = require('./helpers');
const singleImage = require('./models/singleImage');
const multipleImage = require('./models/multipleImage');

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, './public/uploads');
   },
   filename: function (req, file, cb) {
      cb(
         null,
         file.fieldname + '-' + Date.now() + path.extname(file.originalname),
      );
   },
});

const app = express();

app.set('view engine', 'ejs');

app.use(
   bodyParser.urlencoded({
      extended: true,
   }),
);
app.use(express.static('public'));

//connect to database
mongoose.connect('mongodb://localhost:27017/ImageInDB', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
   console.log('Database is connected successfully on port 27017!!!');
});

// GET main page
app.get('/', (req, res) => {
   res.render('file_upload');
});

// Preview single Image
app.get('/preview', (req, res) => {
   // res.render('file_upload');
   singleImage
      .find()
      .populate('multipleImage')
      .exec(function (err, product) {
         res.render('preview', {
            product: product,
         });
      });
});

// Preview Multiple Images
app.get('/multiplePreview', (req, res) => {
   multipleImage.find({}, (err, products) => {
      res.render('multiPreview', {
         products: products,
      });
   });
});

// POST Single Image
app.post('/upload-profile-pic', (req, res) => {
   // 'profile_pic' is the name of our file input field in the HTML form
   let upload = multer({
      storage: storage,
      fileFilter: helpers.imageFilter,
   }).single('profile_pic');
   upload(req, res, function (err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any
      if (req.fileValidationError) {
         return res.send(req.fileValidationError);
      } else if (!req.file) {
         return res.send('Please select an image to upload');
      } else if (err instanceof multer.MulterError) {
         return res.send(err);
      } else if (err) {
         return res.send(err);
      }
      const oneImage = new singleImage({
         singleImage: req.file.filename,
      });
      oneImage.save(err => console.log(err));
      res.redirect('/preview')
   });
});

// POST Multiple Images
app.post('/upload-multiple-images', (req, res) => {
   let upload = multer({
      storage: storage,
      fileFilter: helpers.imageFilter,
   }).array('multiple_images', 10);
   upload(req, res, function (err) {
      if (req.fileValidationError) {
         return res.send(req.fileValidationError);
      } else if (!req.files) {
         return res.send('Please select an image to upload');
      } else if (err instanceof multer.MulterError) {
         return res.send(err);
      } else if (err) {
         return res.send(err);
      }
      const files = req.files;
      const moreImage = new multipleImage({
         multipleImage: files.map(file => file.filename),
      });
      moreImage.save(err => console.log(err));
      res.redirect('/multiplePreview');
   });
});

//connect to localhost
app.listen(3000, function () {
   console.log('Server started on port 3000');
});