'use strict'
// requires
var Recipe = require('../models')
	.Recipe;
var Category = require('../models')
	.Category;

//==============
// Controllers
//==============

module.exports.cacheCategories = function(req, res, next) {
	Category.findCategories(function(err, ctgs) {
		if (err) return err;
		res.locals.categories = ctgs;
		next();
	});
}
// get recipes
module.exports.get = function(req, res) {
	Recipe.findRecipe(req.param('recipeID'), req.param('categoryID'), function(err, recipe) {
		if (err) return res.redirect('/');
		if (req.param('recipeID') && recipe) {
			Recipe.VersionedModel
				.findOne({
					refId: req.param('recipeID'),
				})
				.exec(function(err, version) {
					if (err) return res.redirect('/');
					var ver = version || {};
					if (version) {
						var isVer = false;
						for (var i = 0; i < ver.versions.length; i++) {
							if (req.query.version == ver.versions[i].refVersion) {
								recipe.title = ver.versions[i].title;
								recipe.ingridients = ver.versions[i].ingridients;
								recipe.content = ver.versions[i].content;
								recipe.date = ver.versions[i].date;
								recipe._category._id = ver.versions[i]._category;
								recipe._id = ver.refId;
								isVer = true
								break;
							}
						};
					};
					res.render('recipe', {
						title: "Cookbook",
						recipes: recipe,
						versions: ver.versions || {}
					})
				})
		} else {
			res.render('index', {
				title: "Cookbook",
				recipes: recipe
			})
		}
	})
};
// edit/new recipe
module.exports.edit = function(req, res) {
	if (req.path === '/edit' && req.query !== {}) {
		Recipe.findRecipe(req.query.recipe, req.query.category, function(err, recipe) {
			if (err || recipe.length) return res.redirect('/');
			res.render('edit', {
				title: "Cookbook",
				recipes: recipe,
				action: '/edit?category=' + req.query.category + '&' + 'recipe=' + req.query.recipe + '&_method=PUT',
				submit: 'Update recipe'
			})
		})
	} else {
		res.render('edit', {
			title: "Cookbook",
			recipes: {
				_category: {
					_id: null
				}
			},
			action: '',
			submit: 'Add recipe'
		})
	}
};
// post new recipe
module.exports.post = function(req, res) {
	// create new recipe object from post request if form is not empty
	var b = req.body
	if (b.title && b.category && b.ingridients && b.content) {
		var recipeObj = new Recipe({
			title: b.title,
			_category: b.category,
			ingridients: b.ingridients.split(','),
			content: b.content,
			date: Date.now(),
			lastModified: Date.now()
		});
		// save recipe to db and redirect to this recipe
		recipeObj.save(function(err) {
			if (err) return err;
			Recipe.findRecipe(recipeObj._id, null, function(err, recipe) {
				if (err) return err;
				res.redirect('/' + recipe._category._id + '/' + recipe._id);
			});
		})
	} else {
		res.redirect('/new')
	}
};
// update recipe
module.exports.put = function(req, res) {
	// updating recipe if exists and redirect to this recipe
	var b = req.body;
	if (b.title && b.category && b.ingridients && b.content) {
		Recipe.findById(req.query.recipe, function(err, recipeObj) {
			if (err) return err;
			recipeObj.title = b.title;
			recipeObj._category = b.category;
			recipeObj.ingridients = b.ingridients.split(',');
			recipeObj.content = b.content,
			recipeObj.lastModified = Date.now();
			recipeObj.save(function(err) {
				if (err) return err;
				Recipe.findRecipe(req.query.recipe, b.category, function(err, recipe) {
					if (err) return err;
					res.redirect('/' + recipe._category._id + '/' + recipe._id);
				});
			})
		})
	} else {
		res.redirect('/edit?category=' + req.query.category + '&' + 'recipe=' + req.query.recipe)
	}
};
// delete recipe
module.exports.delete = function(req, res) {
	// delete recipe
	Recipe.findById(req.query.recipe, function(err, recipeObj) {
		if (err) return err;
		recipeObj.remove(function(err) {
			if (err) return err;
			res.redirect('/');
		})
	})
};
// redirection
module.exports.redirect = function(req, res) {
	res.redirect('/');
};