
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    qunit: {
      all: ['test/index.html']
    },


    jshint: {
      options: {
        browser: true,
        sub: true,
        undef: true,
        unused: true
      },
      all: ['astar.js', 'test/tests.js', 'demo/demo.js']
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('default', ['jshint', 'qunit']);

};
