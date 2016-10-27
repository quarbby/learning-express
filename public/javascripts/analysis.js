/*
$('ul.nav > li').removeClass('active');
$('.nav-analysis').addClass('active');

updateFrequentUsers();
updateFrequentWords();


$('.map').hide();
*/

function updateFrequentUsers() {
    $.getJSON('/twitterusers/top', function(data){
        $('#frequent-users-text').empty();
        var frequentUsersString = '';

        for (var i=0; i<data.length; i++) {
            var user = data[i];
            
            var userJsonString = escape(JSON.stringify(user));
            
            frequentUsersString += '<div class="frequent-user-display" data-target="#myModal" data-toggle="modal" data-user=' + userJsonString + ' onclick="showUserInformation(this);">';
            frequentUsersString += '<div class="user-header">';
            frequentUsersString += '<a href="https://twitter.com/' + user.screenname + '" target="_blank">';
            frequentUsersString += '<img class="user-pic" src="' +  user.profilePic + '" target="_blank">';
            frequentUsersString += '</a>';
            frequentUsersString += '</div>'
            frequentUsersString += '<div class="user-body">';
            frequentUsersString += '<span class="username">' + user.screenname + '</span>';
            frequentUsersString += '</div>';
            frequentUsersString += '<div class="user-footer">';
            frequentUsersString += '<span class="count">Number of Posts: ' + user.numberOfTweets + '</span>';
            frequentUsersString += '</div>';
            frequentUsersString += '</div>';
            
        }
        $('#frequent-users-text').html(frequentUsersString);
    });
}

function updateFrequentWords() {
    $.getJSON('/words/top', function(data){
        var frequentWordsHTMLString = '';
        for (var i=0; i<data.length; i++) {
            var w = data[i];
            frequentWordsHTMLString += '<div class="row word-body"><div class="col-xs-6">';
            frequentWordsHTMLString += '<span class="word">' + w['word'] + '</span>';
            frequentWordsHTMLString += '</div><div class="col-xs-3">';
            frequentWordsHTMLString += '<span class="count">' + w['count'] + '</span>';
            frequentWordsHTMLString += '</div></div>';
        }
        
        $('#frequent-words-text').html(frequentWordsHTMLString);
    });
}

function showUserInformation(element) {
    //console.log(element.getAttribute('data-user'));
    var dataAttributeJson = JSON.parse(unescape(element.getAttribute('data-user')));
    //console.log(dataAttributeJson);
    
    $('.modal-profilepic').attr("src", dataAttributeJson['profilePic']);
    
    $('#modal-screenname').text(dataAttributeJson['screenname']);
    $('#modal-userid').text(dataAttributeJson['userid']);
    $('#modal-location').text(dataAttributeJson['location']);
    $('#modal-createdat').text(dataAttributeJson['createdAt']);

    $('.modal-followerscount').text(dataAttributeJson['followersCount']);
    $('.modal-friendscount').text(dataAttributeJson['friendsCount']);
    $('.modal-statusescount').text(dataAttributeJson['statusesCount']);
    $('.modal-favouritecount').text(dataAttributeJson['favouritecount']);

    $('.view-on-twitter-button').wrap($('<a>').attr('href', 'https://twitter.com/' + dataAttributeJson['screenname']));

    console.log(dataAttributeJson);

    var userTweets = dataAttributeJson['tweets'];
    var userTweetHtml = '';
    
    /*
    async.eachSeries(userTweets, function (tweet, callback) {
        $.getJSON('/tweets/' + tweet, function(data){
            userTweetHtml += data['body'];
        });
    });
    */
    
    for (var i=0; i<userTweets.length; i++) {
        var tweet = userTweets[i];
        $.getJSON('/tweets/' + tweet, function(data){
            userTweetHtml += data['body'] + "<br>";
        });
    }
    
    // Hack to handle async usertweets. Should use async library
    setTimeout(function(){
        console.log(userTweetHtml);
        $('.modal-tweet-body').html(userTweetHtml);
    
        $('#myModal').show();        
    }, 2000);


}