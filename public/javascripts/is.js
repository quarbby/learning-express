$('ul.nav > li').removeClass('active');
$('.nav-instagram').addClass('active');

//socket.emit('instagramuser', {instagramuser: 'littlebabypenguin'});

var instagramInterval, instagramType;
var isStreaming = false;

$('.dropdown-menu li').click(function(){
  instagramType = $(this).text();
  $('#instagramDropdownBtn').html(instagramType + '<span class="caret"></span>');
  
  switch(instagramType.toLowerCase()){
        case 'location':
            $('#instagram-input').attr('placeholder', 'Input Location Number e.g. 274029466:');
            break;
        case 'person':
            $('#instagram-input').attr('placeholder', 'Input Username e.g. littlebabypenguin:');
            break;
        case 'hashtag':
            $('#instagram-input').attr('placeholder', 'Input hashtag e.g. singapore:');
            break;
        default:
            break;
  }
  
});

$('#instagram-form').submit(function(event){
    event.preventDefault();
});

function startStreaming(){
    var instagramInput = $('#instagram-input').val().trim();
    instagramInput = instagramInput.toLowerCase();

    instagramInterval = setInterval(function(){
        console.log('Calling ' + instagramType + ' for ' + instagramInput);
        socket.emit('instagram', {type: instagramType.toLowerCase(), msg: instagramInput});
    }, 3000); 
    
};

$('#streaming-button').keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
});

function streamingButtonClicked(){
    if (isStreaming){
        $('#streaming-button').text('Start Streaming');
        console.log('Stopping streaming...');
        clearInterval(instagramInterval);
        isStreaming = false;
    } else {
        $('#streaming-button').text('Stop Streaming');
        startStreaming();
        console.log('Starting Streaming...');
        isStreaming = true;
    }
}

socket.on('instagramcontent', function(msg){
    console.log('instagram content received');
    var content = msg.instagramcontent; 
    
    var header = $(content).find('._3yvxd').text();
    $('.location-header').html(header);
    
    var imgNodes = $(content).find('._8mlbc._vbtk2._t5r8b');
    
    var htmlString = '';
    
    var numPosts = 12;
    var count = 0;
    
    for (var i=numPosts; i<numPosts*2; i++){
        var imgContent = imgNodes[i];
        var pic = $(imgContent).find('._jjzlb').find('img');
        

        if ((count % 3) == 0 && count != 0) {
            htmlString += '</div><div class="row">';
        }
        if ((count % 3) == 0) {
            htmlString += '<div class="row">';
        }
        
        
        htmlString += '<div class="instagram-box col-md-3">'
        htmlString += '<div class="instagram-img"><img src="' + pic.attr('src') + '"></div>';
        htmlString += '<div class="instagram-caption">' + pic.attr('alt') + '</div>';
        htmlString += '</div>';
        
        count++;
        
    }
    htmlString += '</div>';
    $('.instagram-posts').html(htmlString);
});