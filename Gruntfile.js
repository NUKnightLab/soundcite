'use strict';

// Variables
var path = require('path'),
    port = 8000,
    lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

module.exports = function(grunt) {

  // configurable paths
  var soundciteConfig = {
      source: 'soundcite',
      build: 'build'
  };
  
  // cdn configuration
  var cdnConfig = {
      path: path.join('..', 'cdn.knightlab.com', 'app', 'libs', 'soundcite')
  };

  // Project configuration.
  grunt.initConfig({
    // Configs
    pkg: grunt.file.readJSON('package.json'),
    soundcite: soundciteConfig,
    cdn: cdnConfig,

    // Banner for the top of CSS and JS files
    banner: '/* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
            ' */\n',

    // Development server
    connect: {
      livereload: {
        options: {
          port: port,
          middleware: function(connect, options) {
            return [lrSnippet, connect.static(path.resolve('.'))]
          }
        }
      }
    },

    // Open
    open: { 
      dev: {
        path: 'http://localhost:' + port + '/homepage/index.html'
      }
    },

    // Regarde (Watch)
    regarde: {
      html: {
        files: 'homepage/*.html',
        tasks: ['livereload']
      }
    },

    // Uglify
    uglify: {
      uncompressed: {
        options: {
          beautify: true,
          mangle: false,
          preserveComments: true
        },
        files: {
          '<%= soundcite.build %>/js/soundcite.js': '<%= soundcite.source %>/js/*'
        }
      },
      compressed: {
        files: {
          '<%= soundcite.build %>/js/soundcite.min.js': '<%= soundcite.source %>/js/*'
        }
      }
    },

    // Copy
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= soundcite.source %>',
            dest: '<%= soundcite.build %>',
            src: [
              '*.html',
              'css/**',
              '{img,font}/**'
            ]
          }
        ]
      },
      stg: {
        files: [
          {
            expand: true,
            cwd: '<%= soundcite.build %>',
            dest: path.join('<%= cdn.path %>', '<%= pkg.version %>'),           
            src: ['css/**', 'font/**', 'js/**'], 
          }                 
          ]      
        },
      stgLatest: {
        files: [
          {
            expand: true,
            cwd: '<%= soundcite.build %>',
            dest: path.join('<%= cdn.path %>', 'latest'),
            src: ['css/**', 'font/**', 'js/**' ],
          }
        ]
      }
    },
    // Clean
    clean: {
      dist: '<%= soundcite.build %>',
      stg: {
        options: { force: true },
        src: path.join('<%= cdn.path %>', '<%= pkg.version %>')
      },
      stgLatest: {
        options: { force: true },
        src: path.join('<%= cdn.path %>', 'latest')
      }
    },
    // Concat
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= banner %>'
      },
      banner: {
        files: {
          '<%= soundcite.build %>/js/soundcite.js': ['<%= soundcite.build %>/js/soundcite.js'],
          '<%= soundcite.build %>/js/soundcite.min.js': ['<%= soundcite.build %>/js/soundcite.min.js'],
          '<%= soundcite.build %>/css/player.css': ['<%= soundcite.build %>/css/player.css']
        }
      }
    }
  });

  // Load all Grunt task
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  
  grunt.registerTask('check-for-cdn', 'Check for cdn repository', function() {
    // Make sure CDN repo exists
    if(!grunt.file.exists('..', 'cdn.knightlab.com')) {
        grunt.fatal('Could not find local cdn.knightlab.com repository.')
    }
  });
  
  // Define complex tasks
  grunt.registerTask('server', ['livereload-start', 'connect', 'regarde']);
  grunt.registerTask('build', ['clean:dist',  'copy:dist', 'uglify', 'concat']);
  grunt.registerTask('default', ['open:dev', 'server']);  
  grunt.registerTask('stage', "Stage the release for deployment to the CDN", ['check-for-cdn', 'build', 'clean:stg', 'copy:stg']);
  grunt.registerTask('stage-latest', "Stage the release for deployment to the CDN, and copy it to the latest directory", ['stage','clean:stgLatest', 'copy:stgLatest']);

};
