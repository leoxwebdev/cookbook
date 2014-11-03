var gulp = require('gulp');
var supervisor = require('gulp-supervisor');

gulp.task('supervisor', function() {
	supervisor('app.js', {
		args: [],
		watch: [],
		ignore: ['./node_modules', './views'],
		pollInterval: 500,
		extensions: [],
		exec: 'node',
		debug: false,
		debugBrk: false,
		harmony: true,
		noRestartOn: 'exit',
		forceWatch: true,
		quiet: false
	});
});

gulp.task('default', ['supervisor']);