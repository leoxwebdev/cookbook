gulp = require 'gulp'
supervisor = require 'gulp-supervisor'
stylus = require 'gulp-stylus'
concat = require 'gulp-concat'
minifyCSS = require 'gulp-minify-css'
clean = require 'gulp-clean'
rename = require 'gulp-rename'
nib = require 'nib'

gulp.task 'stylus', ->
	gulp.src 'styles/*.styl'
		.pipe stylus 
			use: do nib
		.pipe gulp.dest 'styles/css'

gulp.task 'concat', ['stylus'], ->
	gulp.src 'styles/css/*.css'
		.pipe concat 'all.css'
		.pipe gulp.dest 'styles'

gulp.task 'buildCSS', ['concat'], ->
	gulp.src 'styles/all.css'
		.pipe minifyCSS
			keepSpecialComments:0
			compability:true
			noAdvanced:false
		.pipe rename 'all.min.css'
		.pipe gulp.dest 'public/css'
	gulp.src 'styles/*.css',read:no
		.pipe do clean

gulp.task 'supervisor', ['buildCSS'], ->
	supervisor 'app.js',
		args:[]
		watch:[]
		ignore:['node_modules','bower_components','views','public','styles']
		pollInterval:500
		extensions:[]
		exec:'node'
		debug:false
		debugBrk:false
		harmony:true
		noRestartOn:'exit'
		forceWatch:true
		quiet:false

gulp.task 'watch', ->
	gulp.watch 'styles/*.styl', ['buildCSS']

gulp.task 'default', ['supervisor','watch']