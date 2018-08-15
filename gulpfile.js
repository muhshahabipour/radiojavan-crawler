var gulp = require('gulp'),
    compass = require('gulp-compass'),
    jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon');

gulp.task('compass-task', function () {
    return gulp.src('public/scss/*.scss').pipe(compass({
            config_file: './config.rb',
            css: 'public/styles',
            sass: 'public/scss',
            // style: 'compact',
            // comments: false
        }))
        .pipe(gulp.dest('public/styles'))
        // .pipe(browserSync.reload({
        //     stream: true
        // }))
        
});

var jshintFunc = function (event) {
    gulp.src(event.path)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));
};

gulp.task('watch', function () {
    // compile compass to css then minify all css
    gulp.watch('./public/scss/*.scss', ['compass-task']);

    // jshint
    gulp.watch(['**/*.js', '!gulpfile.js'], jshintFunc);


    // reload using Livereload plugin
    gulp.watch(['**/*.css', '**/*.ejs', '**/*.js'], function (event) {
       gulp.src(event.path).pipe(livereload());
    });


    livereload.listen();
});

gulp.task('browser-sync', ['nodemon-task'], function () {
    browserSync.init({
        proxy: "http://localhost:3005",
        files: ["public/**/*.*"],
        browser: "firefox",
        port: 7000
    });
});

gulp.task('nodemon-task', function () {
    return nodemon({
        script: './public'
    });
});

gulp.task('default', ['watch', 'browser-sync']);