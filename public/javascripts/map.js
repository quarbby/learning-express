
$('ul.nav > li').removeClass('active');
$('.nav-twitter').addClass('active');

/* 
* Map initialisations
*/ 


var map = L.map('map', {
			center: [1.289545, 103.849972],
			zoom: 10,
			zoomControl: true
});

var baseLayer = L.tileLayer.provider('Esri.WorldStreetMap', {maxZoom: 20}).addTo(map);  

var tweetMarkers = L.layerGroup();
//var tweetMarkers = L.markerClusterGroup();
map.addLayer(tweetMarkers);

/* For Leaflet Draw Control */
var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    var drawControl = new L.Control.Draw({
        draw : {
            position : 'topleft',
            polygon : false,
            polyline : false,
            rectangle : false,
            marker : false,
            circle : true
        },
        edit: {
            featureGroup: drawnItems
        }
    });
map.addControl(drawControl);

map.on('draw:created', function (e) {
            var type = e.layerType,
                layer = e.layer;
            drawnItems.addLayer(layer);
        });
        

/* For country selection */
var countrySelection = L.control({position: 'topright'});
countrySelection.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'country');
    div.innerHTML = '<select id=countrySelection onchange="countryChanged()"><option>SG</option><option>MY</option><option>ID</option><option>ALL</option></select>';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
countrySelection.addTo(map);
countryChanged();

// For button popup
var buttonPopupWords = [];

function countryChanged(){
    var country = $('#countrySelection').val();
    console.log('Country: ' + country);
    socket.emit('country', {country: country});
}

// Socket initialised in globals.js
socket.on('mapCenter', function(msg){
    console.log('MapCenterReceived: ' + msg.mapCenter);
    map.setView(msg.mapCenter, 8);
});

function constructTweetMarker(tweet, tweetHTMLString) {
    var greenMarker = L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'twitter',
        markerColor: 'green'
    });
    
    var redMarker = L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'twitter',
        markerColor: 'red'
    });
    
    var tweetIcon; 
    if (containsAnyWords(tweet.body)){
        tweetIcon = redMarker;
        console.log("contains tweet words");
        buttonPopupWords.unshift(tweet);
    } else{
        tweetIcon = greenMarker;
    }
    
    var marker = L.marker([tweet['latitude'], tweet['longtitude']], 
            {icon: tweetIcon,
             bounceOnAdd: true,
             bounceOnAddOptions: {duration: 500, height: 50}
            });
    tweetMarkers.addLayer(marker);
    marker.bindPopup(tweetHTMLString);
    setTimeout(function(){
        tweetMarkers.removeLayer(marker);
    }, 300000);

    // Called from analysis.js
    updateFrequentUsers();
    updateFrequentWords();
}

function goToLocation(location){
    console.log("Go to location: " + location);
    var locationSplit = location.split(',');
    map.setView([parseFloat(locationSplit[0]), parseFloat(locationSplit[1])], 10);
}

function containsAnyWords(str) {
    // wordList from data/words.js
    var substrings = wordList;
    str = str.toLowerCase();
    
    for (var i = 0; i != substrings.length; i++) {
       var substring = substrings[i];
       if (str.indexOf(substring) != - 1) {
         return true;
       }
    }
    return false; 
}

function openWordModal(eventPhrase){
    console.log(eventPhrase);
    
    /*
    var wordString = '';
    for (var i=0; i<buttonPopupWords.length; ++i) {
        var tweet = buttonPopupWords[i];
        //createTweetHTML called from globals.js
        wordString += createTweetHTML(tweet,2);
    }
    
    $('.modal-tweets').html(wordString);
    
    $('#wordModal').show();
    */
    
}

/* For Events */
//TODO: Edit for quotes/ phrases

$('#event-input').keydown(function(event){
    if (event.keyCode == 13){
        event.preventDefault();
        var newEvent = $('#event-input').val().trim();
        addNewEvent(newEvent);
     }
});

function addNewEvent(newEvent){
    // wordList called from data/words.js
    wordList.push(newEvent);
    
    var buttonElement = createButtonElement(newEvent);
    
    $('.event-btn-group').append(buttonElement);
}

function createButtonElement(newEvent){
    var buttonHTML = '';

    buttonHTML += '<div class="btn-group">';
    buttonHTML += '<button class="btn btn-success btn-size" onclick="openWordModal((this.textContent || this.innerText))" data-target="#wordModal" data-toggle="modal">';
    buttonHTML += newEvent + '</button>';
    buttonHTML += '<button class="btn btn-success btn-cross btn-remove"><i class="fa fa-times"></i></button></div>';
    
    return buttonHTML;
}

$('.event-btn-group').on('click', '.btn-remove', function(){
    console.log('Button Removed clicked');
    $(this).parent().remove();
});
