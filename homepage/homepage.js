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
            $('#player_container').find('iframe').attr('src', sc_url)
            var new_iframe = $('#player_container').find('iframe');
            $('#player_container').empty();
            $('#player_container').html(new_iframe);
        }
        else {
            return false;
        }
        $('#explainer').css('display', 'none');
        $('#creation_box').css('display', 'block');
    });
}

// Player functionality

$(".start_btn").live('click', function() {
    var widget_iframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widget_iframe[0]);
    var clicked = $(this);
    widget.getPosition(function(position) {
        clicked.prev('.start').attr('value', Math.round(position));
    });
});

$(".end_btn").live('click', function() {
    var widget_iframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widget_iframe[0]);
    var clicked = $(this);
    widget.getPosition(function(position) {
        clicked.prev('.end').attr('value', Math.round(position));
    });
});

$(".test_btn").live('click', function() {
    var widget_iframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widget_iframe[0]);
    start_time = $('input').prev('.start').val();
    console.log(start_time)
    end_time = $('input').prev('.end').val();
    console.log(end_time)
    widget.seekTo(start_time);
    widget.play();
    widget.bind(SC.Widget.Events.PLAY_PROGRESS, function() {
        widget.getPosition(function(position) {
            if(position >= end_time) {
                widget.toggle();
            }
        });
    });
});

function add() {
    $('#clips').append("<form id='times' class='form-inline'> <input type='text' class='input-small start' placeholder='time (milliseconds)'> <input type='button' value='Start' class='btn start_btn'> <input type='text' class='input-small end' placeholder='time (milliseconds)'> <input type='button' value='End' class='btn end_btn'> <input type='text' class='input-medium linktext' placeholder='text to be hyperlinked'> <input type='button' value='Preview' class='btn test_btn'> <input type='button' value='+' onclick='add();' class='btn-primary'> </form>"); }
// Presenting the code

function bring_code() {
    var widget_iframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widget_iframe[0]);
    $('#header').append(
        "&lt;href='//cdn.knightlab.com/libs/soundcite/latest/css/player.css' rel='stylesheet' type='text/css'&gt;\n"
        + "&lt;script type='text/javascript' src='//connect.soundcloud.com/sdk.js'&gt;&lt;/script&gt;\n"
        + "&lt;script type='text/javascript' src='//cdn.knightlab.com/libs/soundcite/latest/js/soundcite.min.js'&gt;&lt;/script&gt;"
    );
    var linkedtext = $('#linktext').val();
    $('#code').css('display', 'block');
    widget.getCurrentSound(function(currentSound) {
        $('#inline').append("&lt;span class='soundcite' data-id='" + currentSound.id + "' data-start='" + $('.start').val() + "' data-end='" + $('.end').val() + "'&gt;&lt;span class='genericon genericon-video'&gt;&lt;/span&gt;" + $('#linktext').val() + "&lt;/span&gt;");
    });
};


function select_header_code() {
    $('#header').select();
};

function select_inline_code() {
    $('#inline').select();
};
