module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';\n'
      },
      dist: {
        src: ['client/controllers/*.js',
        'client/models/*.js', 
        'client/us-states.js', 'client/newCountries.js', 'client/cities.js',
        'client/collections/*.js', 'client/views/*.js', 
        'client/router.js'],
        dest: 'dist/output.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/output.min.js': ['dist/output.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-qunit');


  grunt.registerTask('default', ['concat','uglify']);

};