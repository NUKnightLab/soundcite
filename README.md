**SoundCite is not ready for widespread use.**

Usually adding audio to a text story is an uncomfortable choice. Either the user reads or listens but never both. Until now.

SoundCite is a simple-to-use tool that helps content creators add audio to their stories. The audio is not isolated in a player positioned off to the side, interrupting the text or housed in a garish player that distracts content consumers from reading.

SoundCite's audio is just a link that plays right under the relevant text.

SoundCite audio adds emotion or context to the text. It never asks users to look away from what their reading. And, most importantly, it requires no technical skills to use.

SoundCite is currently in an alpha, pre-release stage. Check out our GitHub repo and please feel free to contribute! We will have more news on a beta release soon.

## Customizing your SoundCite player

Currently, you can customize the SoundCite progress bar by editing the CSS set dynamically in the track_progress method. Note that you would have to host your own version of the soundcite.js file for this to work.

```javascript
 Clip.prototype.track_progress = function() {
        var totalTime = this.end - this.start;
        var position = this.sound.position;
        var relative_position = position - this.start;
        var percentage = (relative_position / totalTime) * 100

        // change the css to customize your player

        $(this.el).css({
            'background' : '-webkit-linear-gradient(left, white, #ccc ' + percentage + '%, white)'
        });
    }
```

