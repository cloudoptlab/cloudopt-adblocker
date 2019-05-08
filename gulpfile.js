var gulp = require('gulp');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var pipeline = require('readable-stream').pipeline;

/**
 * Importing vendor scripts
 **/
gulp.task('vendors', gulp.parallel(
  () => gulp.src('node_modules/dompurify/dist/purify.min.js')
    .pipe(gulp.dest('dist/lib/')),
     
  () => gulp.src('node_modules/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('dist/lib/')),
     
  () => gulp.src('node_modules/jquery-ui-dist/jquery-ui.min.js')
    .pipe(gulp.dest('dist/lib/')),
     
  () => gulp.src('node_modules/json3/lib/json3.min.js')
    .pipe(gulp.dest('dist/lib/')),
     
  () => gulp.src([
    'node_modules/material-design-lite/dist/material.min.js',
    'node_modules/material-design-lite/dist/material.min.css',
  ])
    .pipe(gulp.dest('dist/lib/mdl/')),
     
  () => gulp.src([
    'node_modules/noty/lib/noty.min.js',
    'node_modules/noty/lib/noty.css',
  ])
    .pipe(gulp.dest('dist/lib/noty/')),
     
  () => gulp.src('node_modules/push.js/bin/push.min.js')
    .pipe(gulp.dest('dist/lib/')),
     
  () => gulp.src('node_modules/underscore/underscore-min.js')
    .pipe(gulp.dest('dist/lib/')),
     
  () => gulp.src('node_modules/babel-polyfill/dist/polyfill.min.js')
    .pipe(gulp.dest('dist/lib/')),
));

/**
 * Transfiling and uglifying code
 **/
gulp.task('compress', function () {
  return pipeline(
    gulp.src([
      '**/*.js',
      '!adguard/adguard-content.js',
      '!gulpfile.js',
      '!node_modules/**'
    ]),
    babel({
      presets: [
        '@babel/preset-env'
      ],
      compact: true,
      sourceType: 'script',
    }),
    uglify({
      mangle: true,
    }),
    gulp.dest('dist')
  );
});

/**
 * Copying other files
 **/
gulp.task('static_files', function () {
  return pipeline([
    gulp.src([
      '**/*.html',
      '**/*.css',
      '**/*.woff2',
      '**/adguard-content.js',
      '**/_locales/**',
      '**/image/**',
      '**/whitelist/**',
      'manifest.json',
      '!node_modules/**',
    ]),
    gulp.dest('dist'),
  ]);
});

/**
 * The production task
 **/
gulp.task('default', gulp.parallel('compress', 'vendors', 'static_files'));
