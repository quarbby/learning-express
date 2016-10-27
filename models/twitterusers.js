var mongoose = require('mongoose');

var TwitterUserSchema = new mongoose.Schema({
    userid     : String,
    screenname : String,
    profilePic : String,
    location   : String,
    followersCount : Number,
    friendsCount : Number,
    favouriteCount : Number,
    statusesCount : Number,
    createdAt: String,
    tweets     : [{type: mongoose.Schema.Types.ObjectId, ref: 'Tweet'}],
    numberOfTweets: {type: Number, default: 1}
});

mongoose.model('TwitterUser', TwitterUserSchema);