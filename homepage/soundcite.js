// Invoke SoundCloud player methods

SC.initialize({
    client_id: "5ba7fd66044a60db41a97cb9d924996a",
    redirect_uri: "http://www.soundcite.com"
});

// Get the song

function connect() {
	var baseURL = $('#url').val();
    $.getJSON('https://soundcloud.com/oembed?callback=?', {
        format: 'js',
        url: baseURL,
        show_comments: 'false'
    },
    function(data) {
        $('#player_container').empty();
        $('#player_container').html(data.html);
        var sc_url = $('#player_container').find('iframe').attr('src')
        if (sc_url.substring(0,5) == "http:") {
            sc_url = "https" + sc_url.substring(4)
            console.log(sc_url);
            $('#player_container').find('iframe').attr('src', sc_url)
            var new_iframe = $('#player_container').find('iframe');
            $('#player_container').empty();
            $('#player_container').html(new_iframe);
        }
        else {
            return false;
        }

    });
}

// Player functionality

var get_start_position = function() {
    var widgetIframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widgetIframe[0]);
    widget.getPosition(function(position) {
           $('#start').attr('value', Math.round(position));
    });
}

var get_end_position = function() {
    var widgetIframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widgetIframe[0]);
    widget.getPosition(function(position) {
       $('#end').attr('value', Math.round(position));
    });
}

function test() {
    var widgetIframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widgetIframe[0]);
    start_time = $('#start').val()
    end_time = $('#end').val()
    widget.seekTo(start_time);
    widget.play();
    widget.bind(SC.Widget.Events.PLAY_PROGRESS, function() {
        widget.getPosition(function(position) {
            if(position > end_time) {
                widget.pause();
            }
        });
    });
}

// Presenting the code

function bringcode() {
    var widgetIframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widgetIframe[0]);
    widget.getCurrentSound(function(currentSound) {
        $('#header').append("&lt;script type='text/javascript' src='//connect.soundcloud.com/sdk.js'&gt;&lt;/script&gt;\n&lt;script type='text/javascript'&gt;var id=\'" + currentSound.id + "\';&lt;/script&gt;\n&lt;script type='text/javascript' src='http://www.soundcite.com/soundcite.js'&gt;&lt;/script&gt;")
    });
	var linkedtext = $('#linktext').val();
	$('#code').css('display', 'block');
	$('#inline').append("&lt;span class='soundcite' data-start='" + $('#start').val() + "' data-end='" + $('#end').val() + "'&gt;" + $('#linktext').val() + "&lt;/span&gt;");
};


function selectheadercode() {
    $('#header').select();
};

function selectinlinecode() {
    $('#inline').select();
};
