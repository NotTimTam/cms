import ArticleModel from "../models/Article.js";
import { handleUnexpectedError } from "../util/controller.js";

/**
 * Create a new article.
 */
export const createArticle = async (req, res) => {};

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
export const findArticleById = async (req, res) => {};

/**
 * Find a specific article by its ID and update it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the article to find.
 * @param {Object} req.body The article update object.
 */
export const findArticleByIdAndUpdate = async (req, res) => {};

/**
 * Find a specific article by its ID and delete it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the article to find.
 */
export const findArticleByIdAndDelete = async (req, res) => {};
