var gulp = require('gulp'),
    compass = require('gulp-compass'),
    bSync = require('browser-sync'),
    nodemon = require('gulp-nodemon');



gulp.task('compass', function (done) {
    gulp.src(['public/scss/**/*.scss', 'public/scss/**/*.sass'])
        .pipe(compass({
            config_file: './public/config.rb',
            css: 'public/styles',
            sass: 'public/scss'
        }).on('error', function (err) {
            console.error('Error!', err.message);
        }))
        .pipe(gulp.dest('public/styles'));

    done();
});

gulp.task('watch', function () {
    gulp.watch('public/scss/**/*.scss', gulp.series('compass'));
    // gulp.watch('public/*.html', browserSync.reload);
    // gulp.watch('public/*.htm', browserSync.reload);
    // gulp.watch('public/js/**/*.js', browserSync.reload);
});


gulp.task('nodemon', function (cb) {
	
	var started = false;
	
	return nodemon({
		script: './public/index.js'
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true; 
		} 
	});
});


gulp.task('browser-sync', gulp.series('nodemon' , function (done) {
    bSync.init({
        proxy: "http://localhost:3000",
        files: ["public/**/*.*", "node_modules/**/*.*"],
        browser: "firefox",
        port: 7000
    });
    done();
}));



gulp.task('default', gulp.series('compass', 'browser-sync', 'watch'));