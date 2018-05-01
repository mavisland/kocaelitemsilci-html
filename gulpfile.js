'use strict';

var gulp = require('gulp'),
    autoPrefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imageMin = require('gulp-imagemin'),
    spritesmith = require('gulp.spritesmith'),
    data = require('gulp-data'),
    nunjucks = require('gulp-nunjucks-render'),
    pkg = require('./package.json'),
    filesys = require('fs'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    archiver = require('gulp-archiver'),
    cache = require('gulp-cache'),
    del = require('del'),
    header = require('gulp-header'),
    gutil = require('gulp-util'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename');

require('es6-promise').polyfill();

var banner = [
  '/*!\n' +
  ' * <%= pkg.description %>\n' +
  ' *\n' +
  ' * <%= pkg.name %>\n' +
  ' * <%= pkg.homepage %>\n' +
  ' *\n' +
  ' * @author <%= pkg.author %> \n' +
  ' * @version <%= pkg.version %>\n' +
  ' * Copyright (c) ' + new Date().getFullYear() + '.\n' +
  ' */',
  '\n'
].join('');

var getTimestamp = function() {
  var date       = new Date();
  var dateYear   = date.getFullYear().toString();
  var dateMonth  = ('0' + (date.getMonth() + 1)).slice(-2);
  var dateDay    = ('0' + date.getDate()).slice(-2);
  var timeHour   = date.getHours().toString();
  var timeMinute = date.getMinutes().toString();
  var timeSecond = date.getSeconds().toString();
  return dateYear + dateMonth + dateDay + '-' + timeHour + timeMinute + timeSecond;
};

gulp.task('archive', function () {
  return gulp.src('dist/**')
    .pipe(archiver(pkg.name + '_build_' + getTimestamp() + '.zip'))
    .pipe(gulp.dest('./build'))
    .pipe(notify({
      message: 'TASK: "archive" Completed! 💯',
      onLast: true
    }));
});

gulp.task("clean", function () {
  return del(['dist']);
});

gulp.task('copy', [
  'copy:icons',
  'copy:images',
  'copy:fonts',
  'copy:scripts'
]);

gulp.task('copy:fonts', function(){
  return gulp.src([
    'src/vendor/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}'
  ])
    .pipe(gulp.dest("./dist/assets/fonts"))
    .pipe(reload({stream: true}))
    .pipe(notify({
      message: 'TASK: "copy:fonts" Completed! 💯',
      onLast: true
    }));
});

gulp.task('copy:icons', function(){
  return gulp.src([
    'src/static/icons/*.{ico,png}'
  ])
    .pipe(gulp.dest("./dist"))
    .pipe(reload({stream: true}))
    .pipe(notify({
      message: 'TASK: "copy:icons" Completed! 💯',
      onLast: true
    }));
});

gulp.task('copy:images', function(){
  gulp.src([
    'src/static/images/*.{jpg,gif,png,svg}'
  ])
    .pipe(cache(imageMin({
      progressive: true,
      optimizationLevel: 7,
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}]
    })))
    .pipe(gulp.dest('./dist/assets/images'))
    .pipe(reload({stream: true}))
    .pipe(notify({
      message: 'TASK: "copy:images" Completed! 💯',
      onLast: true
    }));
});

gulp.task('copy:scripts', function(){
  return gulp.src([
    'src/static/js/jquery.min.js',
    'src/static/js/html5-respond.min.js'
  ])
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(reload({stream: true}))
    .pipe(notify({
      message: 'TASK: "copy:scripts" Completed! 💯',
      onLast: true
    }));
});

gulp.task('images', function(){
  return gulp.src(['src/images/**/*'])
    .pipe(plumber(function(error) {
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      this.emit('end');
    }))
    .pipe(cache(imageMin({
      progressive: true,
      optimizationLevel: 7,
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}]
    })))
    .pipe(gulp.dest('./dist/assets/images'))
    .pipe(reload({stream: true}))
    .pipe(notify({
      message: 'TASK: "images" Completed! 💯',
      onLast: true
    }));
});

gulp.task('scripts', function(){
  gulp.src([
    'src/vendor/bootstrap/js/transition.js',
    'src/vendor/bootstrap/js/alert.js',
    'src/vendor/bootstrap/js/button.js',
    'src/vendor/bootstrap/js/carousel.js',
    'src/vendor/bootstrap/js/collapse.js',
    'src/vendor/bootstrap/js/dropdown.js',
    'src/vendor/bootstrap/js/modal.js',
    'src/vendor/bootstrap/js/tooltip.js',
    'src/vendor/bootstrap/js/popover.js',
    'src/vendor/bootstrap/js/scrollspy.js',
    'src/vendor/bootstrap/js/tab.js',
    'src/vendor/bootstrap/js/affix.js',
    'src/js/main.js'
  ])
    .pipe(plumber(function(error) {
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      this.emit('end');
    }))
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(reload({stream: true}))
    .pipe(notify({
      message: 'TASK: "scripts" Completed! 💯',
      onLast: true
    }));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('src/sprites/*.{png,jpg,gif}').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite-variables.less',
    imgPath: '../images/sprite.png',
    padding: 3,
    imgOpts: {
      quality: 100,
    }
  }));
  spriteData.img.pipe(gulp.dest('src/images/'));
  spriteData.css.pipe(gulp.dest('src/less/helpers/'));
});

gulp.task('styles', function(){
  return gulp.src(['src/less/style.less'])
    .pipe(plumber(function(error) {
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      this.emit('end');
    }))
    .pipe(less({
      paths: ["."]
    }))
    .pipe(autoPrefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cleanCSS({
      compatibility: 'ie8',
      level: { 1: { specialComments: 0 } }
    }))
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(reload({stream: true}))
    .pipe(notify({
      message: 'TASK: "styles" Completed! 💯',
      onLast: true
    }));
});

gulp.task('templates', function(){
  return gulp.src('src/html/*.njk')
    .pipe(plumber(function(error) {
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      this.emit('end');
    }))
    .pipe(data(function() {
      return JSON.parse(filesys.readFileSync('./src/data/site.json'));
    }))
    .pipe(nunjucks({
      path: ['src/html']
    })).on('error', gutil.log)
    .pipe(gulp.dest('./dist'))
    .pipe(reload({stream: true}))
    .pipe(notify({
      message: 'TASK: "templates" Completed! 💯',
      onLast: true
    }));
});

gulp.task('build', ['copy', 'images', 'styles', 'scripts', 'templates']);

gulp.task('default', ['build'], function(){
  browserSync.init({
    server: './dist'
  });
  gulp.watch([
    'src/images/**/*.{gif,jpg,png,svg}',
    'src/static/images/**/*.{gif,jpg,png,svg}'
  ], ['images']);
  gulp.watch([
    'src/sprites/*.{gif,jpg,png,svg}'
  ], ['sprite']);
  gulp.watch([
    'src/less/**/*.less',
    'src/vendor/**/*.less',
  ], ['styles']);
  gulp.watch([
    'src/js/**/*.js',
    'src/vendor/**/*.js'
  ], ['scripts']);
  gulp.watch([
    'src/data/*.json',
    'src/html/**/*.njk'
  ], ['templates']);
});
