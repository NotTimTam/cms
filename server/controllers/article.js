import ArticleModel from "../models/content/Article.js";
import { handleUnexpectedError } from "../util/controller.js";
import {
	validateArticle,
	validateArticleQuery,
	ValidatorError,
	validateArticlePatch,
} from "../util/validators.js";

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
		try {
			req.query = await validateArticleQuery(req.query);
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const {
			search,
			sortField = "createdAt",
			sortDir = "-1",
			status = "normal",
		} = req.query;
		let { page = "0", itemsPerPage = "20" } = req.query;

		const query = {
			status: {
				$in:
					status === "normal"
						? ["published", "unpublished"]
						: [status],
			},
		};

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
 * Patch a selection of articles.
 */
export const batchArticles = async (req, res) => {
	try {
		try {
			req.body = await validateArticlePatch(req.body);
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		try {
			req.query = await validateArticleQuery(req.query);
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const { search, status = "normal" } = req.query;
		let { selection } = req.query;

		if (!selection)
			return res
				.status(400)
				.send('No "selection" parameter provided in query.');

		const query = {
			status: {
				$in:
					status === "normal"
						? ["published", "unpublished"]
						: [status],
			},
		};

		if (search)
			query["$or"] = [
				{ name: { $regex: search, $options: "i" } },
				{ alias: { $regex: search, $options: "i" } },
			];

		const articles = await ArticleModel.find(query)
			.select("+status")
			.lean();

		if (selection === "all")
			selection = articles.map(({ _id }) => _id.toString());
		else selection = selection.split(",");

		const updatedArticles = [];

		for (const id of selection) {
			const article = await ArticleModel.findById(id);

			if (!article)
				return res.status(404).send(`No article found with ID "${id}"`);

			for (const [key, value] of Object.entries(req.body)) {
				article[key] = value;
			}

			await article.save();

			updatedArticles.push(article);
		}

		return res.status(200).json({ articles: updatedArticles });
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
