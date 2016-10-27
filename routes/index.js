var express = require('express');
var router = express.Router();

/* For Mongoose db */
var mongoose = require('mongoose');
var Tweet    = mongoose.model('Tweet');
var Word     = mongoose.model('Word');
var TwitterUser     = mongoose.model('TwitterUser');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TWW' });
});

router.get('/analysis', function(req, res, next) {
   res.render('analysis', {title: 'TWW Analysis'});
});

router.get('/instagram', function(req, res, next) {
   res.render('instagram', {title: 'TWW Instagram'});
});

/* Routing for Tweets */

// Get all tweets
router.get('/tweets', function(req, res, next){
    Tweet.find(function(err, tweets){
        if (err) { 
            //res.status(400).send("400 Bad Request");
            return next(err); 
        }
        res.json(tweets);
        res.status(200).end();
    });
});

// Get tweet with specific ID
router.get('/tweets/:id', function(req, res) {
    return Tweet.findById(req.params.id, function(err, tweet){
        return res.json(tweet);
        return res.status(200).end();
    });
});

/* Routing for WORDS */

// Get all words 
router.get('/words', function(req, res, next){
   Word.find(function(err, words){
      if (err) { return next(err); }
      res.json(words);
   });
});

// Get top n words, default 10
router.get('/words/top', function(req, res, next) {
    var number = req.body.number || 10;
    Word.find({}).sort({count: -1}).limit(number).exec(function(err, words){
        res.json(words); 
   });
});

/* Routing for USERS */

// Get all users 
router.get('/twitterusers', function(req, res, next){
   TwitterUser.find(function(err, twitteruser){
      if (err) { return next(err); }
      res.json(twitteruser);
   });
});

// Get top n users, default 10
router.get('/twitterusers/top', function(req, res, next) {
    var number = req.body.number || 10;
    TwitterUser.find().sort({numberOfTweets: -1}).limit(number).exec(function(err, twitteruser){
        res.json(twitteruser); 
   });
});

module.exports = router;
