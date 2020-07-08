var express  = require('express');
var router   = express.Router();
var passport = require('passport');
var User     = require('../models/user');
var {isLoggedIn} = require('../middleware/index');

// INDEX ROUTE
router.get('/', function(req, res){
  res.render('landing',{ pageTitle:'Home'});
});


// ===================
// AUTH ROUTES
// ===================
router.get('/register', function(req,res){
  res.render('register',{ pageTitle:'Register'});
});

router.post('/register', function(req,res){
  var newUser = new User({username:req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      req.flash("error", err.message);
      return res.redirect('/register');
    }
    passport.authenticate("local")(req,res, function(){
      req.flash("success", "Welcome!! " + user.username);
      res.redirect('/feeds');
    });
  })
});
// ===================
// LOGIN ROUTES
// ===================

router.get('/login', function(req, res){
  res.render('login',{ pageTitle:'Login'});
});
router.post('/login', passport.authenticate("local", {
  failureRedirect:'/login'
}),function(req, res){
  req.flash("success", "Welcome back to Yelp Camp");
  res.redirect('/feeds');
});

// ===================
// LOGOUT ROUTES
// ===================

router.get('/logout', function(req,res){
  req.logout();
//  req.flash("success", "Thanks for visiting!!");
  res.redirect('/');
});

module.exports = router;
