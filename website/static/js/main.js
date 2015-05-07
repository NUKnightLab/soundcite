var clip_duration_in_millis = 0;
var popcorn_clip = null;


function millisToTime(s) { 
// http://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript
  function addZ(n) {
    return (n<10? '0':'') + n;
  }
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  var parts = [], hms = 0;
  if (secs) { parts.push(secs) } else { parts.push(0) };
  if (mins) { parts.push(mins) } else { parts.push(0) };
  if (hrs) parts.push(hrs);
  hms = _(parts).map(addZ).reverse().join(':');
  if (ms) return hms + '.' + ms;
  return hms; // no decimal for zero
}

function secsToTime(s) {
    return millisToTime(Math.floor(s) * 1000);
}

function timeToMillis(s) {
    var hrs = 0, mins = 0, secs = 0;
    if (s.indexOf(':') == 0) s = "0" + s;
    parts = s.split(':');
    parts.reverse();
    secs = parseFloat(parts[0]);
    if (parts.length > 1) {
        mins = parseInt(parts[1]);
        if (parts.length > 2) {
            hrs = parts[2];
        }
    }    
    return (secs * 1000) + (mins * 60 * 1000) + (hrs * 60 * 60 * 1000);
}

function set_end_from_widget() {
    var widget = SC.Widget("player_iframe");
    widget.getDuration(function(duration) { 
        clip_duration_in_millis = duration;
        setTime("#end_field",millisToTime(duration));           
        validate_time_field($("#end_field"));
    });
}

// Get the song
function load_sc_player() {
    $("#url").removeClass("error");
    
    var baseURL = $('#url').val();
    $.ajax({
            type: "POST",
            url: 'https://soundcloud.com/oembed',
            data: { url: baseURL, format: 'json', visual: false },
            success: function(data) {
            if (data) {
                clip_duration_in_millis = 0;
                setTime("#start_field",millisToTime(0));                
                window.data = data;
                $('#player_container').html(data.html);
                $('#explainer').css('display', 'none');
                $('#creation_box').css('display', 'block');
                var new_iframe = $('#player_container iframe')[0];
                $(new_iframe).attr('id','player_iframe');
                var widget = SC.Widget('player_iframe');
                widget.bind(SC.Widget.Events.READY,set_end_from_widget);
                $(new_iframe).height(166);
            } else {
                $("#url").addClass('error');
            }
        },
            dataType: 'json'
    });
}

function load_audio_file() {
    $("#url").removeClass("error");
    
    var url = $('#url').val();
    
    $('#audio_player').attr("src", url);

    popcorn_clip = Popcorn('#audio_player', {'frameAnimation': true});
    popcorn_clip.on('loadeddata', function() {
        var parts = url.split('/');
        $('#audio_name').html(parts[parts.length - 1]);
        $('#audio_container').show();
        
        clip_duration_in_millis = Math.floor(popcorn_clip.duration()) * 1000;        
        setTime('#start_field', millisToTime(0));
        setTime('#end_field', millisToTime(clip_duration_in_millis));  
        
        $('#explainer').css('display', 'none');
        $('#creation_box').css('display', 'block');
        validate_time_field($("#end_field"));       
    });   

    $('#audio_player')[0].load();
}

function load_sound(url) {
    if(popcorn_clip) {
        popcorn_clip.pause();
        popcorn_clip.destroy();
        popcorn_clip = null;
    }

    $('#player_container').empty();
    $('#audio_container').hide();   
    $("#times")[0].reset();

    if(url.match(/^https?:\/\/soundcloud.com\//i)) {
        load_sc_player();
    } else if(url.match(/\.(mp3|ogg)$/i)) {
        load_audio_file();
    } else {
        $("#url").addClass('error');
    }
}

// Player functionality

function setTime(field_id, position, validate) { 
    position = String(position);
    
    if (position.match(/^\d+$/)) { // all digits is good
        $(field_id).val(millisToTime(position));
    } else { // for now, trust everything
        $(field_id).val(position);
    }
    if (validate) {
        validate_form();
    }
}

function getTimeAsMillis(field_id) {
    // get the time from the given field, converting from h:m:s.s to millis if need be
    var value = $(field_id).val();
    if (value.indexOf('.') == -1 && value.indexOf(':') == -1) return value;
    return timeToMillis(value);
}


var soundcloud_clip_base_template = _.template($("#soundcloud-clip-base-template").html().trim());
var file_clip_base_template = _.template($("#file-clip-base-template").html().trim());

var clip_preview_template = _.template($("#clip-preview-template").html().trim());
var create_error_template = _.template($("#create-error-template").html().trim());

$('#audition_area').on("click",".delete-clip", function() {
    var the_sound = $(this).prev('.soundcite');
    for(var i = 0; i < soundcite.clips.length; i++) {
        if(the_sound[0] === soundcite.clips[i].el) {
            soundcite.clips.splice(i, 1);
        }
    }
    $(this).parents(".clip").remove();
});

function create_clip() {
    if(validate_form()) {
        if(popcorn_clip) {
            popcorn_clip.pause();
            var clip_html = file_clip_base_template({
                url: $('#url').val(),
                start: getTimeAsMillis('#start_field'),
                end: getTimeAsMillis('#end_field'),
                plays: $('#plays_field').val(),
                text: $('#linktext').val()
            });
            $('#audition_area').css('display', 'block');
            $('#audition_area_status').css('display', 'none');
            $('#audition_area').prepend(clip_preview_template({clip_html: clip_html}))
            $('#audition_area .clip:first').find('.soundcite').each(function() {
                new soundcite.PopcornClip(this);
            });
        } else {
            var widget = SC.Widget("player_iframe");
            widget.pause();
            widget.getCurrentSound(function(sound_metadata) {
                var clip_html = soundcloud_clip_base_template({
                    id: sound_metadata.id,
                    start: getTimeAsMillis('#start_field'),
                    end: getTimeAsMillis('#end_field'),
                    plays: $('#plays_field').val(),
                    text: $('#linktext').val()
                });
                $('#audition_area').css('display', 'block');
                $('#audition_area_status').css('display', 'none');
                $('#audition_area').prepend(clip_preview_template({clip_html: clip_html}))
                $('#audition_area .clip:first').find('.soundcite').each(function() {
                    new soundcite.SoundCloudClip(this);
                });
            });
        }
    } else {
        //console.log('not valid?');
    }
}

function show_errors(msgs) {
    $("#create-error").remove();
    var $error_box = $(create_error_template());
    if (msgs) {
        var $error_list = $("<ul>").appendTo($error_box);
        for (var i = 0; i < msgs.length; i++) {
            var msg = $("<li>").text(msgs[i]).appendTo($error_list);
        }
    }
    $("form#times").after($error_box);
}

function validate_required($el, label, msgs) {
    $el.parent().removeClass("error");
    
    if ($el.val().match(/.+/)) {
        return true;
    }
    $el.parent().addClass("error");
    msgs.push(label + " must not be blank.")
    return false
}

function validate_time_field($el, label, msgs) {
    var value = $el.val();
    if (value) {
        $el.parent().removeClass("error");
        if (value.match(/^\d+$/)) {
            $el.val(millisToTime(value));
        } else if (isNaN(timeToMillis(value))) {
            $el.parent().addClass("error");
            if (msgs) {
                msgs.push(label + " is not a valid time. Use mm:ss format.")
            }
            return false;
        } else if (timeToMillis(value) < 0) {
            msgs.push(label + " must not be a negative number." + value);
            return false;
        } else if (clip_duration_in_millis > 0 && timeToMillis(value) > clip_duration_in_millis) {
            msgs.push(label + " is beyond the end of the clip.")
            return false;
        }       
    }
    return true;
}

function validate_form() {
    var msgs = [];
    $("#create_clip").removeAttr("disabled");
    $("#create-error").remove();
    validate_required($("#start_field"),"Start time", msgs);
    validate_time_field($("#start_field"),"Start time", msgs);
    validate_required($("#end_field"),"End time", msgs);
    validate_time_field($("#end_field"),"End time", msgs);
    validate_required($("#linktext"),"Link text", msgs);
    var start = getTimeAsMillis("#start_field");
    var end = getTimeAsMillis("#end_field");
    if (start && end && (end < start)) {
        msgs.push("End time must be after start time.")
        $("#start_field").parent().addClass("error");
        $("#end_field").parent().addClass("error");
    }
    if (msgs && msgs.length > 0) {
        $("#create_clip").attr("disabled","disabled");
        show_errors(msgs);
        return false;
    }
    return true;
}


$("#url").keyup(function(event) { 
    $("#url").removeClass("error");
    if(event.keyCode == 13) { $('#load-sound').click();}
});

$(".example-url").click(function() {
    $("#url").val($(this).text());
    $('#load_url').click();
});

$('#load_url').click(function(event) {
    load_sound($('#url').val().trim());
    event.preventDefault();
});

$("#start_field, #end_field, #linktext").change(validate_form);

$("#linktext").keyup(function() {
    validate_form();
});

$("#start_btn").click(function() {
    if(popcorn_clip) {
        setTime("#start_field", secsToTime(popcorn_clip.currentTime()), true)
    } else {
        var widget = SC.Widget("player_iframe");
        widget.getPosition(function(position) {
            setTime("#start_field", millisToTime(position), true)
        });
    }
});

$("#end_btn").click(function() {
    if(popcorn_clip) {
        setTime("#end_field", secsToTime(popcorn_clip.currentTime()), true)
    } else {
        var widget = SC.Widget("player_iframe");
        widget.getPosition(function(position) {
            setTime("#end_field", millisToTime(position), true)
        });
    }
});

$('#create_clip').click(create_clip);

$('#header').click(function() {
    $('#header').select();
});

$('#audition_area').on('click', 'textarea.code', function() {
    $(this).select();
});


