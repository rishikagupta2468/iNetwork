var express = require('express');
const multer = require('multer');
var cloudinary = require('cloudinary').v2;
var bodyParser = require('body-parser');
var express    = require('express');
var   app        = express();

//const cloudinaryStorage = require("multer-storage-cloudinary");
var router  = express.Router();
var {isLoggedIn, checkOwner} = require('../middleware/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

cloudinary.config({ 
  cloud_name: 'dk96tpgwo', 
  api_key: '257327353339548', 
  api_secret: 'c4ItASdO3ykmYH5T5U8Ga2q-VBM' 
});

var upload= multer({
  storage: multer.diskStorage({destination: './public/upload/'}),
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  },
  fileFilter: (req, file, cb)=>{
    if(!file.mimetype.match(/jpg|jpe|jpeg|png$i/)){
      cb(new Error('File is not supported'), false);
      return;
    }
    cb(null, true);
  }
});


router.get('/', (req,res)=>{
  Feed.find({}, (err,allFeeds)=>{
    if(err){
      console.log("Error", err);
    }else{
      res.render('index', {feeds:allFeeds, pageTitle:'Feeds'});
    }
  })
});


// CREATE ROUTE
router.post('/',isLoggedIn,(req,res)=>{
  //const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var name = req.body.name;
  var desc = req.body.description;
  //console.log(result);
  var newFeed = {name:name, description: desc, author: author};
  Feed.create(newFeed,(err,feed)=>{
    if(err){
      console.log(err);
    }else{
      console.log(feed);
      req.flash('success', `${feed.name} has been created.`);
      res.redirect('/feeds/'+feed._id);
    }
  });
});

// NEW ROUTE
router.get('/new', isLoggedIn, (req,res)=>{
  res.render('new', { pageTitle:'Add New Feed'});
});


// EDIT Route
router.get('/:id/edit', isLoggedIn, function(req,res){
  Feed.findById(req.params.id, (err,campground)=>{
    res.render('edit', {feed:feed, pageTitle:'Edit Feed'});
  });
});





// UPDATE Route
router.put('/:id', checkOwner, function(req,res){
  Feed.findByIdAndUpdate(req.params.id, req.body.feed, (err, feed)=>{
    if(err){
      res.redirect('/feeds');
    }else{
      res.redirect('/feeds/' + req.params.id);
    }
  })
});

// SHOW
router.get('/:id', function(req, res){
  Feed.findById(req.params.id).populate("comments").exec((err, found)=>{
    if(err){
      console.log("Feed not found", err);
    }else{
      console.log(found);
      res.render("show", {feed: found, pageTitle: found.name});
    }
  });
});

// DESTROY route
router.delete('/:id', checkOwner, function(req, res){
  Feed.findByIdAndRemove(req.params.id, (err)=>{
      if(err){
        res.redirect('/feeds/:id');
      }else{
        res.redirect('/feeds');
      }
    });
});


module.exports = router;
