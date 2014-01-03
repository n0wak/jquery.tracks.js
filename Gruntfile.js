module.exports = function(grunt) {

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        uglify: {
            options: {                
                sourceMap: 'jquery.tracks.source-map.js',
                banner: '/*! <%= pkg.name %> \n ' +
                        '* @author <%= pkg.author %> \n ' +
                        '* @version <%= pkg.version %> \n ' +
                        '* \n ' +
                        '* See <%= pkg.version %> for more info. \n ' +
                        '* \n ' +
                        '* Copyright (c) Mike Nowak. Released under the MIT License <http://www.opensource.org/licenses/mit-license.php> \n ' +
                        '*/ \n'
            },
                
            prod: {
                src: 'jquery.tracks.js',
                dest: 'jquery.tracks.min.js'                 
            }
        },

        watch: {
            uglify : {
                files: ['jquery.tracks.js'],
                tasks: ['uglify']
            }
        }
    });
    grunt.registerTask('default', ['uglify']);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
