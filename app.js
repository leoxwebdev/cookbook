'use strict'
// requires
var controllers = require('./controllers/controllers');
var config = require('./config');
var compression = require('compression');
var h5bp = require('h5bp');

//==============
// Server
//==============

// server starts
if (!module.parent) {
	var app = h5bp.createServer({
		root: __dirname + '/public'
	});
	app.disable('x-powered-by')
		.disable('etag')
		.listen(config.PORT || 3000, function() {
			console.log("Listening at port " + config.PORT)
		})
};

// server's static
app.use(h5bp({
	root: __dirname + '/public'
}));
app.use(compression());
app.use(require('express')
	.static(__dirname + '/public'));

//==============
// Settings
//==============

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

//==============
// Middleware
//==============

// caching categories from db
app.use(controllers.cacheCategories);

// favicon
app.use(require('serve-favicon')(__dirname + '/public/favicon.ico'));

// logger
app.use(require('morgan')('dev'));

// body-parser
app.use(require('body-parser')
	.urlencoded({
		extended: true
	}));

// VERB methods override
app.use(require('method-override')('_method'));

// router
app.use(require('./controllers/routes')
	.router);

//==============
// Error handlers
//==============

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
};

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});