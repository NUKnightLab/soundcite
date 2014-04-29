// window.Popcorn.version = 1.5.6
// http://popcornjs.org/code/dist/popcorn-complete.min.js
//
//

(function(window, document, version, callback) { // http://stackoverflow.com/questions/2170439/how-to-embed-javascript-widget-that-depends-on-jquery-into-an-unknown-environmen
    var loaded_j = false;
    var loaded_p = false;   
    // document.head not standard before HTML5
    var insertionPoint = document.head || document.getElementsByTagName('head').item(0) || document.documentElement.childNodes[0];
    
    function load_jquery(version, cb) {
        var js, d;       
        if (!(js = window.jQuery) || version > js.fn.jquery || cb(js)) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://code.jquery.com/jquery-1.9.1.min.js";       
            script.onload = script.onreadystatechange = function() {
                if(!loaded_j && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
                    js = window.jQuery.noConflict(1);
                    cb(js, loaded_j = true);
                    js(script).remove();               
                }
            };       
            insertionPoint.appendChild(script);
        } 
    }
        
    function load_popcorn(j, version, cb) {
        var js, d;      
        if(!(js = window.Popcorn) || version > js.version || cb(js)) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://popcornjs.org/code/dist/popcorn-complete.min.js";
            script.onload = script.onreadystatechange = function() {
                if(!loaded_p && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
                    cb(window.Popcorn, loaded_p = true);
                    j(script).remove();               
                }
            };       
            insertionPoint.appendChild(script);
        } 
    }
    
    load_jquery(version, function(j) {
        load_popcorn(j, "1.5.6", function(p) {
            callback(j, p);       
        });
    });
     
})(window, document, "1.3", function($, $Popcorn) {
    $(document).ready(function () {
        var SOUNDCITE_CONFIG = {
            update_playing_element: function(el, percentage) {
                $(el).css({
                    'background' : '-webkit-linear-gradient(left, rgba(0,0,0,.15)' + percentage + '%, rgba(0,0,0,.05)' + (percentage + 1) + '%)',
                    'background' : 'linear-gradient(to right, rgba(0,0,0,.15)' + percentage + '%, rgba(0,0,0,.05)' + (percentage + 1) + '%)'
                });
            }
        }
        $.extend(SOUNDCITE_CONFIG, window.SOUNDCITE_CONFIG)
        // global vars
        window.soundcite = {};

        var clips = [];
        var $audio = $('<div class="soundcite-audio"></div>');
        
        $('body').append($audio);

        // initialize SoundCloud SDK
        SC.initialize({
            client_id: "5ba7fd66044a60db41a97cb9d924996a",
        });

        // borrowing underscore.js bind function
        var bind = function(func, context) {
            var slice = Array.prototype.slice;
            var args = slice.call(arguments, 2);
            return function() {
              return func.apply(context, args.concat(slice.call(arguments)));
            };
        };

// Clip
        function Clip(el) {
            this.el = el;
            this.$el = $(this.el);
            this.start = el.attributes['data-start'].value || 0;        // ms
            this.end = el.attributes['data-end'].value;                 // ms
            this.playing = false;
            this.times_played = 0;            
            this.sound = null;                          // implement in subclass
        }
        
        Clip.prototype.sound_loaded = function() {
            this.$el.click(bind(this.click_handler, this));           
            this.$el.addClass('soundcite-loaded soundcite-play');        
        }
        
        Clip.prototype.play = function() {
            this.$el.removeClass('soundcite-play');
            this.play_sound();                          // implement in subclass
            this.playing = true;
            this.times_played++;
            //this.$el.addClass('soundcite-pause');           
        }

        Clip.prototype.pause = function() {
            this.$el.removeClass('soundcite-pause');
            this.$el.addClass('soundcite-play');
            this.playing = false;
            this.pause_sound();                         // implement in subclass
        }
        
        Clip.prototype.stop = function() {    
            this.stop_sound();                          // implement in subclass
            this.playing = false;
            this.position_sound(this.start);            // implement in subclass
            this.$el.removeClass('soundcite-pause');
            this.$el.addClass('soundcite-play');            
        }

        Clip.prototype.track_progress = function() {
            var totalTime = this.end - this.start;
            var position = this.sound_position();       // implement in subclass
            var relative_position = position - this.start;
            var percentage = (relative_position * 100) / totalTime;            
            SOUNDCITE_CONFIG.update_playing_element(this.el, percentage);
        }

        Clip.prototype.click_handler = function() {
             for(var i = 0; i < clips.length; i++) {
                if(this.el !== clips[i].el) {
                    clips[i].pause();
                 }
            }
             
            if(this.playing) {
                this.pause();
            } else {
                this.play();
            }
        }

// SoundCloud Clip
        function SoundCloudClip(el) {
            Clip.apply(this, Array.prototype.slice.call(arguments));

            this.id = el.attributes['data-id'].value;

            SC.stream(this.id, bind(function(sound) {
                this.sound = sound;
                sound.load({onload: bind(this.sound_loaded, this)});
            }, this));
        }
        SoundCloudClip.prototype = Object.create(Clip.prototype);

        SoundCloudClip.prototype.sound_position = function() {
            return this.sound.position;
        }

        SoundCloudClip.prototype.position_sound = function(pos) {
            this.sound.setPosition(pos);
        }
        
        SoundCloudClip.prototype.play_sound = function() {
            if (this.times_played == 0 || this.sound.position > this.end) {
                this.sound.setPosition(this.start);
            }
            if (this.times_played > 0) {
                this.sound.setPosition(this.sound.position);
            }

            this.sound.play({
                whileplaying: bind(function() {
                    this.track_progress();

                    if(this.sound.position > this.end) {
                        this.stop();
                    }
                }, this),
            });
            
            this.$el.addClass('soundcite-pause');
        }
        
        SoundCloudClip.prototype.pause_sound = function() { 
            this.sound.pause();
        }
        
        SoundCloudClip.prototype.stop_sound = function() {
            this.sound.stop();
        }
                
// Popcorn Clip    
        function PopcornClip(el) {
            Clip.apply(this, Array.prototype.slice.call(arguments));
 
            this.id = 'soundcite-audio-'+clips.length;
            this.url = el.attributes['data-url'].value;
           
            // convert to ms to secs
            this.start = Math.floor(this.start / 1000);
            this.end = Math.floor(this.end / 1000);
                              
            $audio.append('<audio id="'+this.id+'" src="'+this.url+'" preload="true"></audio>');   
            this.sound = $Popcorn('#'+this.id, {'frameAnimation': true});
                        
            // Safari iOS Audio streams cannot be loaded unless triggered by a 
            // user event, so actually load in play_sound via click
            this.sound.on('loadeddata', bind(function() {
                if(!this.end) {
                    this.end = this.sound.duration();
                }                  
                this.sound.cue(this.end, bind(this.stop, this)); 
            }, this));
                         
            this.sound_loaded();
        } 
        PopcornClip.prototype = Object.create(Clip.prototype);
     
        PopcornClip.prototype.sound_position = function() {
            return this.sound.currentTime();
        }

        PopcornClip.prototype.position_sound = function(pos) {
            this.sound.currentTime(pos);
        }

        PopcornClip.prototype.play_sound = function() {   
            this.$el.addClass('soundcite-loading');
                     
            $('#'+this.id).on('canplaythrough', bind(function() {
                this.$el.removeClass('soundcite-loading');
                this.$el.addClass('soundcite-pause');
          
                if (this.times_played == 0 || this.sound.roundTime() > this.end) {
                    this.sound.play(this.start)
                } else {   
                    this.sound.play();
                }       
        
                this.sound.on('timeupdate', bind(this.track_progress, this));
                this.sound.on('ended', bind(this.stop, this));
            }, this));
            
            $('#'+this.id)[0].load();            
        }
        
        PopcornClip.prototype.pause_sound = function() {
            this.sound.pause();      
            this.sound.off('timeupdate');
        }
        
        PopcornClip.prototype.stop_sound = function() {
            this.sound.pause();
            this.sound.off('timeupdate');
        }

// set up clips array
        var soundcite_array = $('.soundcite');
        
        for(var i = 0; i < soundcite_array.length; i++) {
            var el = soundcite_array[i];          
            if(el.hasAttribute('data-url')) {
                clips.push(new PopcornClip(el));
            } else {
                clips.push(new SoundCloudClip(el));
            }
        }
        
        soundcite.Clip = Clip;
        soundcite.SoundCloudClip = SoundCloudClip;
        soundcite.PopcornClip = PopcornClip;
    });  
});
