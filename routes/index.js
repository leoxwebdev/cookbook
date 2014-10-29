var express = require('express');
var Recipe = require('../db')
	.Recipe;
var Category = require('../db')
	.Category;
var async = require('async');
var router = express.Router();

router.get('/', function(req, res) {
	async.parallel([

			getCategories,
			function(callback) {
				getRecipesByCategory(null, function(err, recipes) {
					if (err) return err;
					callback(null, recipes);
				});
			}
		],
		function(err, results) {
			if (err) return err;
			res.render('index', {
				title: "Cookbook",
				categories: results[0],
				recipes: results[1]
			})
		})
});
router.route('/new')
	.get(function(req, res) {
		async.waterfall([
			getCategories
		], function(err, categories) {
			if (err) return err;
			res.render('new', {
				title: "Cookbook",
				categories: categories,
			})
		})
	})
	.post(function(req, res) {
		var b = req.body
		if (b.title && b.category && b.ingridients && b.content) {
			var recipeObj = new Recipe({
				title: b.title,
				_category: b.category,
				ingridients: b.ingridients.split(','),
				content: b.content,
				date: Date.now()
			});
			recipeObj.save(function(err) {
				if (err) return err;
				getRecipeByID(recipeObj._id, null, function(err, recipe) {
					if (err) return err;
					res.redirect('/' + recipe._category._id + '/' +
						recipe._id);
				});
			})
		} else {
			res.redirect('/new')
		}
	})
router.get('/:categoryID', function(req, res) {
	async.parallel([

			getCategories,
			function(callback) {
				getRecipesByCategory(req.param('categoryID'), function(err, recipes) {
					if (err) return err;
					callback(null, recipes);
				});
			}
		],
		function(err, results) {
			if (err) return err;
			res.render('index', {
				title: "Cookbook",
				categories: results[0],
				recipes: results[1]
			})
		})
});
router.route('/:_category/:_id')
	.get(function(req, res) {
		async.parallel([

				getCategories,
				function(callback) {
					getRecipeByID(req.param('_id'), req.param('_category'), function(err, recipe) {
						if (err) return err;
						callback(null, recipe)
					})
				}
			],
			function(err, results) {
				if (err) return err;
				if (results[1]) {
					res.render('recipe', {
						title: "Cookbook",
						categories: results[0],
						recipes: results[1]
					})
				} else {
					res.redirect('/');
				}
			})
	})
	.delete(function(req, res) {
		Recipe.remove({
			_id: req.param('_id')
		}, function(err) {
			if (err) return err;
			res.redirect('/');
		})
	});
router.route('/:categoryID/:_id/edit')
	.get(function(req, res) {
		async.parallel([

				getCategories,
				function(callback) {
					getRecipeByID(req.param('_id'), req.param('categoryID'), function(err, recipe) {
						if (err) return err;
						callback(null, recipe)
					})
				}
			],
			function(err, results) {
				if (err) return err;
				if (results[1]) {
					res.render('edit', {
						title: "Cookbook",
						categories: results[0],
						recipes: results[1]
					})
				} else {
					res.redirect('/');
				}
			})
	})
	.put(function(req, res) {
		var b = req.body;
		if (b.title && b.category && b.ingridients && b.content) {
			Recipe.update({
				_id: req.param('_id')
			}, {
				title: b.title,
				_category: b.category,
				ingridients: b.ingridients.split(','),
				content: b.content,
				date: Date.now()
			}, function(err) {
				if (err) return err;
				getRecipeByID(req.param('_id'), b.category, function(err, recipe) {
					if (err) return err;
					res.redirect('/' + recipe._category._id + '/' +
						recipe._id);
				});
			});
		} else {
			res.redirect('/' + req.param('categoryID') + '/' +
				req.param('_id') + '/' + 'edit')
		}
	})
router.get(/.+/, function(req, res) {
	res.redirect('/');
});

function getCategories(callback) {
	Category
		.find({})
		.select('_id title')
		.sort('_id')
		.exec(
			function(err, categories) {
				if (err) return err;
				callback(null, categories);
			});
};

function getRecipeByID(id, categoryID, callback) {
	Recipe
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
};

function getRecipesByCategory(category, callback) {
	Recipe.find({})
		.populate({
			path: '_category',
			match: {
				_id: category,
			},
			select: 'title'
		})
		.select('title _category')
		.limit(7)
		.sort('-date')
		.exec(callback);
}

module.exports.router = router;