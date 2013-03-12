$(document).ready(function () {
		SC.initialize({
			client_id: "5ba7fd66044a60db41a97cb9d924996a",
			redirect_uri: "http://localhost:9292/soundcite",
		});
		SC.stream("https://api.soundcloud.com/tracks/61188346", function(sound) {
			sound.load();
			$('.soundcite').css('border-width' : '5px', 'border-color': 'rgba(0, 0, 0, .1)', 'color' : '#ececec', 'border-radius' : '10px', 'padding' : '0 5px 0 5px', 'display' : 'inline-block', 'text-shadow' : '1px 1px 5px black', 'cursor' : 'pointer'}); 
			$('.soundcite').click(function () {
				var start = $(this).attr('data-start');
				var end = $(this).attr('data-end');
				sound.setPosition(start); 
				sound.onPosition(end, function() { sound.pause(); })
				sound.play({
					whileplaying: function() {
						var totalTime = end;
						var position = sound.position;
						var percentage = (position / totalTime) * 100
						$('.soundcite').css({'background' : '-webkit-linear-gradient(left, black, #ccc ' + percentage + '%, black)'});
					}
				});
			});

		});
	});