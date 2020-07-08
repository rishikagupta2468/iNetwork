var express    = require('express');
var router     = express.Router({mergeParams: true});
var Feed = require('./../models/feed');
var Comment = require('./../models/comment');
var {isLoggedIn, checkCommentOwner} = require('../middleware/index');



// =================
// COMMENTS ROUTES
// =================
router.get('/new', isLoggedIn, (req,res)=>{
  Feed.findById(req.params.id,(err, feed)=>{
    if(err){
      console.log(err);
    }else{
      res.render("comments/new", {feed:feed});
    }
  });
});

router.post('/', isLoggedIn, (req,res)=>{
  Comment.create(req.body.comment, function (err, comment) {
    if (err) {
        console.log(err);
    } else {
        Feed.findOne({"_id": req.params.id}).populate('comments').exec(function (err, feed) {
            if (err) {
                console.log(err);
                res.redirect('/feeds');
            } else {
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                comment.save();
                feed.comments.push(comment);
                feed.save();
                console.log(feed);
                req.flash('success', 'Successfully added comment');
                res.redirect('/feeds/' + feed._id);
            }
        });
    }
});
});

// COMMENTS EDIT ROUTE
router.get('/:comment_id/edit', checkCommentOwner, (req,res)=>{
  Comment.findById(req.params.comment_id, (err, foundComment)=>{
    if(err){
      res.redirect('back');
    }else{
      res.render('comments/edit', {feed_id: req.params.id, comment:foundComment});
    }
  });
});

// COMMENTS UPDATE ROUTE
router.put('/:comment_id', checkCommentOwner, (req,res)=>{
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
    if(err){
      res.redirect('back');
    }else{
      req.flash("success", "Successfully edited comment");
      res.redirect('/feeds/' + req.params.id);
    }
  });
});

// DESTROY ROUTE
router.delete('/:comment_id', checkCommentOwner, (req, res)=>{
  Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
    if(err){
      res.redirect('back');
    }else{
      req.flash("success", "Comment deleted");
      res.redirect('/feeds/' + req.params.id);
    }
  })
})

module.exports = router;
