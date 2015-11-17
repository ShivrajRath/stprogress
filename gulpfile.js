/**
 * Tasks Runner for the code.
 * It runs code quality check and minimizes the code
 */

(function () {
  'use strict';

  // Gulp
  var gulp = require('gulp');

  // Plugins
  var jshint = require('gulp-jshint');
  var uglify = require('gulp-uglify');
  var jscs = require('gulp-jscs');

  // Paths
  gulp.paths = {
    src: './src'
  };

  var paths = gulp.paths;
  var srcDev = paths.src + '/stprogress.js';
  var srcMin = paths.src + '/min';

  /***************************************************** JAVASCRIPT LINTING ****************************************************/
  gulp.task('lint', function () {
    gulp.src(srcDev)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(jshint.reporter('fail'));
  });

  /********************************************* RUNS JAVASCRIPT CODE STYLING RULES *********************************************/
  gulp.task('jscs', function () {
    gulp.src(srcDev)
      .pipe(jscs());
  });

  /********************************************* MINFIFY THE SCRIPT FILE *********************************************/
  gulp.task('minify', function () {
    gulp.src(srcDev)
      .pipe(uglify())
      .pipe(gulp.dest(srcMin));
  });

})();
