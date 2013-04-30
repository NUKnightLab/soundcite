'use strict';

module.exports = function(grunt) {

  // configurable paths
  var soundciteConfig = {
      source: 'soundcite',
      build: 'build'
  };

  // Project configuration.
  grunt.initConfig({
    // Configs
    pkg: grunt.file.readJSON('package.json'),
    soundcite: soundciteConfig,

    // Banner for the top of CSS and JS files
    banner: '/* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
            ' */\n',

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
      }
    },

    // Clean
    clean: {
      dist: '<%= soundcite.build %>'
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
  grunt.loadNpmTasks('grunt-contrib-clean');
  
  // Define complex tasks
  grunt.registerTask('build', ['clean',  'copy', 'uglify', 'concat']);
};
