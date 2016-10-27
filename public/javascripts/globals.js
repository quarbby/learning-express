
/*
* Navigation bar click
*/

$(document).ready(function () {
    $('ul.nav > li').click(function (e) {
        $('ul.nav > li').removeClass('active');
        $(this).addClass('active');                
    });            
});

/*
* Globals
*/

var latestTweetsArray = [];
var latestTweetsLength = 10;

var socket = io();

socket.on('tweet', addNewTweet);

function addNewTweet(tweet) {
    console.log("Adding tweet on client: ");
    
    constructTweet(tweet);
}

function constructTweet(tweet) {
    var tweetHTMLString = createTweetHTML(tweet,1);
    
    // Add to tweets array
    latestTweetsArray.unshift(tweetHTMLString);
    if (latestTweetsArray.length > latestTweetsLength) { latestTweetsArray.pop(); }
    var latestTweetsText = '';
    for (var i=0; i<latestTweetsArray.length; i++) {
        latestTweetsText += latestTweetsArray[i];
    }
    $('#latest-tweets-text').html(latestTweetsText);
    

    if ($('#map').length) {
        // constructTweetMarker is in map.js
        constructTweetMarker(tweet, tweetHTMLString);
    }

}

function createTweetHTML(tweet, index){
    var htmlString = '';
    if(index==1) {
        htmlString += '<div class="tweet">';
    }
    if(index==2) {
        htmlString += '<div class="tweet-word">';
    }
    
    htmlString += '<div class="tweet-header">';
    htmlString += '<div class="row">';
    htmlString += '<div class="col-md-3"><img src="' + tweet.profilePic + '"></div>';
    htmlString += '<a href="https://www.twitter.com/' + tweet.screenname + '" target="_blank">';
    htmlString += '<div class="col-md-6"><div class="username">' + tweet.screenname + '</div></a>';
    htmlString += '<div class="timestamp">Tweeted on ' +  tweet.date + '</div>';
    htmlString += '</div>';
    htmlString += '<div class="col-md-3"><i class="fa fa-twitter fa-lg"></i></div>';
    htmlString += '</div></div>';
    htmlString += '<a href="https://www.twitter.com/statuses/' + tweet.tweetid + '" target="_blank">';
    htmlString += '<div class="tweet-body">' + tweet.body + '</div></a>';
    htmlString += '<div class="tweet-footer"><i class="fa fa-map-marker fa-lg"></i>';
    htmlString += '<span class="location" onClick="goToLocation((this.textContent || this.innerText))">' + tweet.latitude + ',' + tweet.longtitude + '</span>';
    htmlString += '</div></div>';
    
    return htmlString;
}
