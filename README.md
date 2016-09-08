# Inline audio players. Easy to make. Seamless to publish.

Usually adding audio to a text story is an uncomfortable choice. Either the user reads or listens but never both. Until now.

SoundCite is a simple-to-use tool that helps content creators add audio to their stories. The audio is not isolated in a player positioned off to the side, interrupting the text or housed in a garish player that distracts content consumers from reading.

SoundCite's audio is just a link that plays right under the relevant text.

SoundCite audio adds emotion or context to the text. It never asks users to look away from what their reading. And, most importantly, it requires no technical skills to use.


## Customizing your SoundCite player

Currently, you can customize the SoundCite progress bar by editing the CSS set dynamically in the track_progress method. Note that you would have to host your own version of the soundcite.js file for this to work.

```javascript
 Clip.prototype.track_progress = function() {
        var totalTime = this.end - this.start;
        var position = this.sound.position;
        var relative_position = position - this.start;
        var percentage = (relative_position / totalTime) * 100

        // change the css to customize your player

        this.el.style.cssText = 
         'background: -webkit-linear-gradient(left, rgba(0,0,0,.15)' + percentage + '%, rgba(0,0,0,.05)' + (percentage + 1) + '%);'
       + 'background: linear-gradient(to right, rgba(0,0,0,.15)' + percentage + '%, rgba(0,0,0,.05)' + (percentage + 1) + '%);';

    }
```

## Development

Requires:
 * the KnightLab [fablib](https://github.com/NUKnightLab/fablib) repository which should be co-located with the soundcite repo.
 * Python 2.7.x
 * Node & npm

### Setup

 * create a virtualenv (Python 2)
 * `pip install -r requirements.txt`
 * `npm install less -g`
 * `npm install uglify-js -g`
 * `fab -l` to see available build commands

### Web application development

The web application is hosted at http://soundcite.knightlab.com. This is where
users can create embed codes. In development, it runs as a Flask application
via `fab serve`. For deployment, it is compiled into a static site.

The web application and its assets are located in the `website` directory of
this repository.
