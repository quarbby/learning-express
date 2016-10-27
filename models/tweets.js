var mongoose = require('mongoose');

var TweetSchema = new mongoose.Schema({
    personid       : String, 
    tweetid        : String,
    active         : Boolean, 
    author         : String, 
    profilePic     : String, 
    body       : String, 
    date       : String, 
    dayOfWeek  : Number,
    screenname : String,
    retweeted  : Number,
    favourited : Number,
    hashtags   : [],
    urls       : [],
    userMentions: [],
    latitude   : Number,
    longtitude : Number
});

mongoose.model('Tweet', TweetSchema);