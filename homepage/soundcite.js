$(document).ready(function () {
    var start;
    var end;

    // borrowing underscore.js bind function

    var scBind = function(func, context) {
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        var args = slice.call(arguments, 2);
        return function() {
          return func.apply(context, args.concat(slice.call(arguments)));
        };
    };

    SC.initialize({
        client_id: "5ba7fd66044a60db41a97cb9d924996a",
    });
    $('body').append('<link rel="stylesheet" href="http://soundcite.com/player.css" type="text/css" />');
    var soundcite_array = $('.soundcite');
    var ids = [];
    for (i = 0; i < soundcite_array.length; i++) {
        ids.push(soundcite_array[i].attributes['data-id'].value);
    }
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
                console.log(sound.url);
                console.log(start)
                console.log(end)
                sound.setPosition(start);
                sound.onPosition(end, function() {
                    sound.pause();
                });
                if (sound.url == 'http://api.soundcloud.com/tracks/' + this_id + '/stream?client_id=5ba7fd66044a60db41a97cb9d924996a' ) {
                    sound.play({
                        whileplaying: function() {
                            console.log('working');
                            var totalTime = end - start;
                            var position = sound.position;
                            var relative_position = position - start;
                            var percentage = (relative_position / totalTime) * 100
                            clicked.css({'background' : '-webkit-linear-gradient(left, white, #ccc ' + percentage + '%, white)'});
                            // clicked.click(function() {
                            //     sound.pause();
                            // })
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
