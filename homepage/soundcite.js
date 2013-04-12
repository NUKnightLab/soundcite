$(document).ready(function () {
    // global vars
    var start;
    var end;
    var ids = [];

    // borrowing underscore.js bind function
    var scBind = function(func, context) {
        var args = slice.call(arguments, 2);
        return function() {
            return func.apply(context, args.concat(slice.call(arguments)));
        };
    };

    // initialize SoundCloud SDK
    SC.initialize({
        client_id: "5ba7fd66044a60db41a97cb9d924996a",
    });

    // load player chrome
    $('body').append('<link rel="stylesheet" href="http://soundcite.com/player.css" type="text/css" />');

    // get all soundcite objects and grab their SoundCloud ids
    var soundcite_array = $('.soundcite');
    for (i = 0; i < soundcite_array.length; i++) {
        ids.push(soundcite_array[i].attributes['data-id'].value);
    }

    //load each sound and attach click handler
    for (i = 0; i < ids.length; i++) {
        SC.stream(ids[i], function(sound) {
            sound.load({
                onload: function() {
                    $('.soundcite').addClass('soundcite-loaded');
                }
            });
            $('.soundcite').click(function () {
                var clicked = $(this);
                start = clicked.attr('data-start');
                end = clicked.attr('data-end');
                var this_id = clicked.attr('data-id');
                sound.setPosition(start);
                if (sound.url == 'http://api.soundcloud.com/tracks/' + this_id + '/stream?client_id=5ba7fd66044a60db41a97cb9d924996a' ) {
                    sound.play({
                        whileplaying: function() {
                            var totalTime = end - start;
                            var position = sound.position;
                            var relative_position = position - start;
                            var percentage = (relative_position / totalTime) * 100
                            clicked.css({'background' : '-webkit-linear-gradient(left, white, #ccc ' + percentage + '%, white)'});

                            if (sound.position > end) {
                                sound.pause();
                            }
                        },
                        onpause: function() {
                            sound.setPosition(start);
                        },
                    });
                };
            });
        });
    }
});
