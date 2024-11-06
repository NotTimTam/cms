import ArticleModel from "../models/Article.js";
import { nameToAlias } from "../util/alias.js";
import { handleUnexpectedError } from "../util/controller.js";
import { aliasRegex, nameRegex } from "../../util/regex.js";
import { validateArticle, ValidatorError } from "../util/validators.js";

/**
 * Create a new article.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The article creation object.
 */
export const createArticle = async (req, res) => {
	try {
		const {
			user: { _id: author },
		} = req;

		req.body.author = author;

		try {
			req.body = validateArticle(req.body);
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const article = new ArticleModel(req.body);

		await article.save();

		return res.status(200).json({ article });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query articles.
 */
export const findArticles = async (req, res) => {
	try {
		const articles = await ArticleModel.find({})
			.select("+status")
			.populate("author")
			.lean();

		return res.status(200).json({
			articles: articles.map((article) => ({
				...article,
				author: { name: article.author.name, _id: article.author._id },
			})),
		});
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

		const article = await ArticleModel.findById(id).select(
			"+status +notes"
		);

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

		if (req.body._id && id.toString() !== req.body._id.toString())
			return res
				.status(400)
				.send(
					'Request body "_id" parameter does not match request "_id" parameter.'
				);

		const article = await ArticleModel.findById(id);

		if (!article)
			return res.status(404).send(`No article found with id "${id}"`);

		try {
			req.body = validateArticle(req.body);
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		article = { ...article, ...req.body }; // Store new values.

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
