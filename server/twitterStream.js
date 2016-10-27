var twitter = require('ntwitter');
var moment  = require('moment-timezone');
var async   = require('async');
var phantom  = require('phantom');

/* Custom JS utility */
var config  = require('./config');
var twitterLocations = require('./twitterlocations');
var stringUtility = require('./stringutility');

/* For mongoose db */
var mongoose        = require('mongoose');
var Tweet           = mongoose.model('Tweet');
var Word            = mongoose.model('Word');
var TwitterUser     = mongoose.model('TwitterUser');

var twit = new twitter(config.twitter);
var socket, io;

module.exports = function(server, app, s) {
    //io = require('socket.io').listen(server);
    socket = s;
    socket.emit('mapCenter', {mapCenter: twitterLocations.sg.center});
    
    var streamingLocation = twitterLocations.sg.bounds;

    socket.on('country', function(msg){
        var newCountry = msg.country.toLowerCase();
        console.log('CountryReceived: ' + newCountry);
        var newcenter = twitterLocations[newCountry]['center'];
        streamingLocation = twitterLocations[newCountry]['bounds'];
        socket.emit('mapCenter', {mapCenter: newcenter});
        streamTweetsFromArea(streamingLocation);
    });
    
    
    // Testing instagram
    socket.on('instagram', function(msg){
        var instagramType = msg.type; 
        var instagramInput = msg.msg;
        
        var sitepage = null;
        var phantomInstance = null;

        phantom.create()
            .then(instance => {
                phantomInstance = instance;
                return instance.createPage();
            })
            .then(page => {
               sitepage = page;
               
               var url;
               
               switch (instagramType){
                    case 'location':
                        url = 'https://www.instagram.com/explore/locations/' + instagramInput;
                        break;
                    case 'people':
                        url = 'https://www.instagram.com/' + instagramInput;
                        break;
                    case 'hashtag':
                        url = 'https://www.instagram.com/explore/tags/' + instagramInput;
                        break;
               }
               
               console.log('Navigating to Instagram Url... ' + url);
               //person: https://www.instagram.com/littlebabypenguin
               //tags: https://www.instagram.com/explore/tags/penguin
               //location: https://www.instagram.com/explore/locations/274029466/
               return page.open(url);
            })
            .then(status => {
                console.log("Get instagram page status: " + status);
                return sitepage.property('content');
            })
            .then(content => {
              //console.log(content);
              socket.emit('instagramcontent', {instagramcontent: content});
              sitepage.close();
              phantomInstance.exit();
            })
            .catch(error => {
               console.log(error);
               phantomInstance.exit();
            });

    });
    
};

function streamTweetsFromArea(streamingLocation){
    console.log('Streaming Location: ' + streamingLocation);
    twit.stream('statuses/filter', 
    {
        'locations': streamingLocation,   
    }, 
    function(stream) {
        stream.on('data', function(data) {
            console.log('New tweet onto server');
            //console.log(data);
            
            async.waterfall([
                processDataToTweetObject(data),
                addTweetToDatabase,
                addTweetUserToDatabase
            ], function(err, result){
                //console.log("Error " + err);
            });
            
        });
    });
}

function processDataToTweetObject(data, callback) {
    return function (callback) {
        console.log('Process Data to Tweet Object');
        
        var tweet = {
            personid: data['id'],
            tweetid: data['id_str'],
            active: false,
            author: data['user']['name'],
            body: data['text'],
            screenname: data['user']['screen_name'],
            retweeted: data['retweet_count'],
            favourited: data['favourite_count'],   
            url: [],
            userMentions: [],
            hashtags: []
        };   
        
        for (var u in data['entities']['urls']) {
            //console.log(u);
            var url = unescape(u['url']);
            tweet['url'].push(url);
        }
        
        for (var u in data['entities']['user_mentions']) {
            var user = u['screen_name'];
            tweet['userMentions'].push(user);
        }
        
        for (var h in data['entities']['hashtags']) {
            var hashtag = h['text'];
            tweet['hashtags'].push(hashtag);
        }
        
        var profilePic = data['user']['profile_image_url'].replace(/^http:\/\//i, 'https://');
        tweet['profilePic'] = profilePic;
        
        var originalDate = data['created_at'];
        var sgDate = moment(originalDate, 'ddd MMM DD HH:mm:ss ZZ YYYY').tz('Asia/Singapore');
        tweet['dayOfWeek'] = sgDate.day();

        var newDate = sgDate.format('D MMM YYYY [at] hh:mm:ss a');
        tweet['date'] = newDate;
        
        if (data['coordinates'] != null) {
            //console.log('tweet has coordinates');
            tweet['latitude'] = data['coordinates']['coordinates'][1];
            tweet['longtitude'] = data['coordinates']['coordinates'][0];
        } 
        else {
            //console.log('tweet doesnt have coordinates');
            var boundingbox = data['place']['bounding_box']['coordinates'][0];
            var center = findCenterOfBoundingBox(boundingbox);
            tweet['latitude'] = center[1];
            tweet['longtitude'] = center[0];
        }
    
        callback (null, tweet, data);
    }
}

function findCenterOfBoundingBox(boundingBox) {
    var topRight = boundingBox[1];
    var bottomLeft = boundingBox[3];
    
    var long = (parseFloat(topRight[0]) + parseFloat(bottomLeft[0])) / 2;
    var lat = (parseFloat(topRight[1]) + parseFloat(bottomLeft[1])) / 2;
    
    return [long, lat];
}

function addTweetToDatabase(tweet, data, callback) {
    //return function (callback) {
        console.log('addTweetToDatabase');

        var tweetEntry = new Tweet(tweet);
        var tweetDbEntry = null;
        addTweetWordsToDatabase(tweet.body);
        
        tweetEntry.save(function(err, tweetObj){
            if (!err) { 
                //console.log(tweetEntry); 
                socket.emit("tweet", tweetEntry);
                //console.log(tweetObj._id);
                tweetDbEntry = tweetObj._id;
                callback (null, tweetDbEntry, data);
            }
        });
        
        
        //return tweetDbEntry;
        //return callback (null, tweetDbEntry, data);
    //}
}

function updateWordDatabase(word){
    var wordJson = {
        word: word,
    };
            
    Word.find({word: word}, function(err, docs){
        if(docs.length) { 
            //console.log('Word already exists'); 

            docs[0].count += 1;
            docs[0].save(function(err2){
                //if(!err) { console.log('Word: ' + word + ' saved ' + docs[0].count); }
            });
            
        }
        else { 
            //console.log('Word does not exist');
            var wordEntry = new Word(wordJson);
            wordEntry.save(function(err){
                //if (!err) { console.log('Word: ' + word + ' saved') };
            });
        }
    });
}

function addTweetWordsToDatabase(tweetBody) {
    var tweetBodyWithoutLinks = stringUtility.removeLinksFromString(tweetBody);
    var keywords = stringUtility.extractKeywordsFromString(tweetBodyWithoutLinks);
    
    async.each(keywords, function(wordToUpdate){
        updateWordDatabase(wordToUpdate);
    });
}

function addTweetUserToDatabase(tweetDbId, data, callback) {
    console.log('Add tweet user to database');
    
    var userjson = {
        userid: data['id'],
        screenname: data['user']['screen_name'],
        tweets: [],
        location: data['user']['location'] || '',
        followersCount: data['user']['followers_count'],
        friendsCount: data['user']['friends_count'],
        favouritesCount: data['user']['favourites_count'],
        statusesCount: data['user']['statuses_count'],
        createdAt: data['user']['created_at']
    };
    
    var profilePic = data['user']['profile_image_url'].replace(/^http:\/\//i, 'https://');
    userjson['profilePic'] = profilePic;
    
    userjson['tweets'].push(tweetDbId);

    /*
    async function findAndAddTwitterUser(){
        
    }
    */
            
    TwitterUser.find({userid: userjson['userid']}, function(err, docs){
        if(docs.length) { 
            //console.log('User already exists'); 

            docs[0].numPosts += 1;
            
            // update screenname
            if (!(docs[0].screenname == userjson['screenname'])) {
                docs[0]['screenname'] = userjson['screenname'];
            }
            
            // update profilepic
            if (!(docs[0]['profilePic'] == userjson['profilePic'])) {
                docs[0]['profilePic'] = userjson['profilePic'];
            }
            
            // update statusesCount
            if (!(docs[0] == userjson['statusesCount'])) {
                docs[0]['statusesCount'] = userjson['statusesCount'];
            }
            
            // update followersCount
            if (!(docs[0] == userjson['followersCount'])) {
                docs[0]['followersCount'] = userjson['followersCount'];
            }
            
            // update favouriteCount
            if (!(docs[0] == userjson['favouriteCount'])) {
                docs[0]['favouriteCount'] = userjson['favouriteCount'];
            }
            
            docs[0].tweets.push(tweetDbId);
            
            docs[0].numberOfTweets = docs[0].tweets.length;
            
            docs[0].save(function(err2){
                if(!err) { console.log('User successfully saved ' + docs[0].numPosts); }
            });
            
            
        }
        else { 
            //console.log('User does not exist');
            var userEntry = new TwitterUser(userjson);
            userEntry.save(function(err){
                if (!err) { console.log('User: ' + userjson['screenname'] + ' saved') };
            });
        }
    }); 
    
    return callback(null, 'done');
}



