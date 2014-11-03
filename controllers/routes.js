'use strict'
// requires
var router = require('express')
	.Router();
var controllers = require('./controllers');

//==============
// Routes
//==============

// new/edit recipe 
router.route(/\/new|\/edit/)
	.get(controllers.edit)
	.post(controllers.post)
	.put(controllers.put)
	.delete(controllers.delete);

// navigate recipes
router.route('/:categoryID?/:recipeID?')
	.get(controllers.get);

// redirection for wrong routes
router.route(/.+/)
	.get(controllers.redirect);

//==============
// Exports
//==============

module.exports.router = router;