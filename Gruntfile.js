/*global grunt*/
'use strict';
module.exports = function (grunt) {

    grunt.initConfig({
        cssmin:{
            target: {
                files: {
                    'public/css/style.min.css': [
                        'public/css/style.css'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['cssmin']);

};