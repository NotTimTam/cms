import ArticleModel from "../models/Article.js";
import { nameToAlias } from "../util/alias.js";
import { handleUnexpectedError } from "../util/controller.js";
import { aliasRegex } from "../util/regex.js";

/**
 * Create a new article.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The article update object.
 */
export const createArticle = async (req, res) => {
	try {
		let { name, alias, content } = req.body;

		if (!name)
			return res
				.status(400)
				.send('No "name" property provided for article creation.');

		if (!alias) alias = nameToAlias(name);
		else if (!aliasRegex.test(alias))
			return res
				.status(400)
				.send(
					`Invalid "alias" property provided for article creation. Aliases must be 1-1024 characters of lowercase letters, numbers, underscores, and dashes only.`
				);

		if (await ArticleModel.findOne({ alias }))
			return res
				.status(422)
				.send("An article already exists with that alias.");

		const article = new ArticleModel({ name, alias, content });

		await article.save();

		return res.status(200).send({ article });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query articles.
 */
export const queryArticles = async (req, res) => {
	try {
		const articles = await ArticleModel.find({});

		return res.status(200).json({ articles });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific article by its ID.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the article to find.
 */
export const findArticleById = async (req, res) => {
	try {
		const { id } = req.params;

		const article = await ArticleModel.findById(id);

		if (!article)
			return res.status(404).send(`No article found with id "${id}"`);

		return res.status(200).json({ article });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific article by its alias.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.alias The alias of the article to find.
 */
export const findArticleByAlias = async (req, res) => {
	try {
		const { alias } = req.params;

		const article = await ArticleModel.findOne({ alias });

		if (!article)
			return res
				.status(404)
				.send(`No article found with alias "${alias}"`);

		return res.status(200).json({ article });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific article by its ID and update it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the article to find.
 * @param {Object} req.body The article update object.
 */
export const findArticleByIdAndUpdate = async (req, res) => {
	try {
		const { id } = req.params;

		const article = await ArticleModel.findById(id);

		if (!article)
			return res.status(404).send(`No article found with id "${id}"`);

		const { name, alias, content } = req.body;

		if (!name)
			return res
				.status(400)
				.send('No "name" property provided for article creation.');

		if (!alias) alias = nameToAlias(name);
		else if (!aliasRegex.test(alias))
			return res
				.status(400)
				.send(
					`Invalid "alias" property provided for article creation. Aliases must be 1-1024 characters of lowercase letters, numbers, underscores, and dashes only.`
				);

		if (await ArticleModel.findOne({ alias }))
			return res
				.status(422)
				.send("An article already exists with that alias.");

		article.name = name;
		article.alias = alias;
		article.content = content;

		await article.save();

		return res.status(200).json({ article });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific article by its ID and delete it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the article to find.
 */
export const findArticleByIdAndDelete = async (req, res) => {
	try {
		const { id } = req.params;

		await ArticleModel.findByIdAndDelete(id);

		return res.status(200).send("Article deleted successfully.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
