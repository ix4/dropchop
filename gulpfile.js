var gulp = require('gulp');
var sourcemap = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify');
var copy = require('gulp-copy');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var ghPages = require('gulp-gh-pages');
var Server = require('karma').Server;
var file = require('gulp-file');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('sass', function(){
  return gulp.src('./src/scss/dropchop.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./docs/static/css'));
});

var vendorCSS = [
  './node_modules/font-awesome/css/font-awesome.css'
];

gulp.task('css_vendor', function() {
  return gulp.src(vendorCSS)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./docs/static/css'));
});

gulp.task('mapbox_assets', function() {
  return gulp.src('./lib/mapbox.js/images/**.*')
    .pipe(gulp.dest('./docs/static/css/images'));
});

var vendorJS = [
  './node_modules/jquery/dist/jquery.js',
  './node_modules/browser-filesaver/FileSaver.js',
  './node_modules/mousetrap/mousetrap.js',
  './node_modules/esri2geo/esri2geo.js',
  './node_modules/osmtogeojson/osmtogeojson.js',
  './node_modules/shp-write/shpwrite.js',
  './node_modules/shpjs/dist/shp.min.js',
  './docs/static/js/turf_package.js',
  './docs/static/js/topojson_package.js',
  './docs/static/js/overpass-wizard.js',
  './docs/static/js/overpass-wizard-expand.js'
];

gulp.task('lint', function() {
  return gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('js', function() {
  return gulp.src('./src/js/**/*.js')
    .pipe(sourcemap.init())
    .pipe(concat('dropchop.js'))
    .pipe(uglify())
    .pipe(sourcemap.write())
    .pipe(gulp.dest('./docs/static/js'));
});

gulp.task('topojson', function() {
  return browserify(['./lib/topojson_setup.js'])
    .bundle()
    .pipe(source('topojson_package.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./docs/static/js/'));
});

gulp.task('turf', function() {
  return browserify(['./lib/turf_setup.js'])
    .bundle()
    .pipe(source('turf_package.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./docs/static/js/'));
});

gulp.task('overpass-wizard', function() {
  browserify(['./node_modules/overpass-wizard/index.js'], {standalone: "overpass-wizard"})
    .bundle()
    .pipe(source('overpass-wizard.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./docs/static/js/'));
  browserify(['./node_modules/overpass-wizard/expand.js'], {standalone: "overpass-wizard-expand"})
    .bundle()
    .pipe(source('overpass-wizard-expand.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./docs/static/js/'));
});

gulp.task('vendor', ['topojson', 'turf', 'overpass-wizard'], function() {
  return gulp.src(vendorJS)
    .pipe(sourcemap.init())
    .pipe(concat('vendor.js'))
    .pipe(minify())
    .pipe(sourcemap.write())
    .pipe(gulp.dest('./docs/static/js'));
});

gulp.task('html', function() {
  return gulp.src('./src/html/**.html')
    .pipe(gulp.dest('./docs'));
});

gulp.task('assets', function() {
  return gulp.src('./src/assets/**/*.*')
    .pipe(gulp.dest('./docs/assets'));
});

gulp.task('fa-fonts', function() {
  return gulp.src('./node_modules/font-awesome/fonts/**.*')
    .pipe(gulp.dest('./docs/static/fonts'));
});

gulp.task('watch', function() {
  gulp.watch('./src/js/**/*.js', ['js']);
  gulp.watch('./src/scss/**/*.scss', ['sass']);
  gulp.watch('./src/html/**.html', ['html']);
});

gulp.task('connect', function() {
  connect.server({
    port: '8888',
    root: 'docs'
  });
});

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('cname', function() {
  return gulp.src('./CNAME')
    .pipe(gulp.dest('./docs/CNAME'));
});

gulp.task('build', [
  'js',
  'vendor',
  'html',
  'sass',
  'css_vendor',
  'mapbox_assets',
  'fa-fonts',
  'assets',
  'cname',
]);

gulp.task('default', ['build', 'connect', 'watch']);
