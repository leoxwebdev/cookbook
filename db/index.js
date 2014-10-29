var mongoose = require('mongoose');

mongoose.connect('mongodb://nybble:vjyujyfdn@ds035300.mongolab.com:35300/cookbook');

var categorySchema = new mongoose.Schema({
	_id: Number,
	title: String
});

var recipeSchema = new mongoose.Schema({
	title: String,
	ingridients: [String],
	date: Date,
	_category: {
		type: Number,
		ref: 'Category'
	},
	content: String
});

var Recipe = mongoose.model('Recipe', recipeSchema);
var Category = mongoose.model('Category', categorySchema);

module.exports.Recipe = Recipe;
module.exports.Category = Category;