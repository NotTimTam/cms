import ArticleModel from "../models/Article.js";
import { handleUnexpectedError } from "../util/controller.js";
import { sortEnum } from "../../util/enum.js";
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

		const articleWithHighestOrder = await ArticleModel.findOne({}).sort({
			order: -1,
		});

		req.body.order = articleWithHighestOrder
			? articleWithHighestOrder.order + 1
			: 0;

		try {
			req.body = await validateArticle(req.body);
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
		const { search, sortField = "createdAt", sortDir = "-1" } = req.query;
		let { page = "0", itemsPerPage = "20" } = req.query;

		if (!sortEnum.includes(sortField))
			return res
				.status(400)
				.send(
					`Invalid "sortField" provided. Must be one of: ${sortEnum}`
				);
		if (sortDir !== "-1" && sortDir !== "1")
			return res
				.status(400)
				.send(
					'Invalid "sortDir" provided. Expected either "-1" or "1".'
				);

		if (isNaN(page) || !Number.isInteger(+page) || +page < 0)
			return res
				.status(400)
				.send(
					`Request "page" parameter must be an integer greater than 0.`
				);

		if (
			itemsPerPage !== "all" &&
			(isNaN(itemsPerPage) ||
				!Number.isInteger(+itemsPerPage) ||
				+itemsPerPage < 0)
		)
			return res
				.status(400)
				.send(
					`Request "itemsPerPage" parameter must be an integer greater than 0 or the string "all".`
				);

		const query = {};

		if (search)
			query["$or"] = [
				{ name: { $regex: search, $options: "i" } },
				{ alias: { $regex: search, $options: "i" } },
			];

		const numArticles = await ArticleModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numArticles : +itemsPerPage;

		const numPages = Math.ceil(numArticles / itemsPerPage);

		if (page > numPages - 1) page = numPages - 1;

		const articles = await ArticleModel.find(query)
			.sort({ [sortField]: +sortDir })
			.select("+status")
			.populate("author")
			.limit(+itemsPerPage)
			.skip(+page * +itemsPerPage)
			.lean();

		return res.status(200).json({
			articles: articles.map((article) => ({
				...article,
				author: { name: article.author.name, _id: article.author._id },
			})),
			page: +page,
			numPages,
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

		const article = await ArticleModel.findById(id).select(
			"+status +notes"
		);

		if (!article)
			return res.status(404).send(`No article found with id "${id}"`);

		try {
			req.body = await validateArticle({
				...(await ArticleModel.findById(id)
					.select("+status +notes")
					.lean()),
				...req.body,
			});
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		// Store new values.
		for (const [key, value] of Object.entries(req.body)) {
			article[key] = value;
		}

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
