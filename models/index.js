'use strict'
// requires
var mongoose = require('mongoose');
var version = require('mongoose-version');
var config = require('../config');

// connecting to db
mongoose.connect('mongodb://' + config.USER + ':' + config.PASSWORD + '@' + config.DB);

//============
// Schemas
//============

// defining schema for categories
var categorySchema = new mongoose.Schema({
	_id: Number,
	title: String
});

// defining schema for recipes
var recipeSchema = new mongoose.Schema({
	title: String,
	ingridients: [String],
	date: Date,
	_category: {
		type: Number,
		ref: 'Category'
	},
	content: String,
	lastModified: Date,
});

recipeSchema.plugin(version, {
	removeVersions: true,
	suppressVersionIncrement: false
});

//============
// Statics
//============

// find categories
categorySchema.statics.findCategories = function(callback) {
	this
		.find({})
		.select('_id title')
		.sort('_id')
		.exec(callback);
};

recipeSchema.statics.findRecipe = function(id, categoryID, callback) {
	if (id) {
		this
			.findOne({
				_id: id
			})
			.populate({
				path: '_category',
				match: {
					_id: categoryID,
				},
				select: 'title'
			})
			.exec(callback)
	} else {
		this
			.find({})
			.populate({
				path: '_category',
				match: {
					_id: categoryID,
				},
				select: 'title'
			})
			.select('title _category')
			.limit(7)
			.sort('-date')
			.exec(callback);
	}
};

//============
// Exports
//============

module.exports.Recipe = mongoose.model('Recipe', recipeSchema);
module.exports.Category = mongoose.model('Category', categorySchema);