import ArticleModel from "../models/Article.js";
import UserModel from "../models/users/User.js";
import { aliasRegex, nameRegex } from "../../util/regex.js";
import { nameToAlias } from "./alias.js";
import { sortEnum, statusEnum } from "../../util/enum.js";

export class ValidatorError {
	constructor(code, message) {
		if (typeof code !== "number")
			throw new TypeError(
				"Invalid code value provided to ValidatorError constructor. Expected a number."
			);
		if (typeof message !== "string")
			throw new TypeError(
				"Invalid message value provided to ValidatorError constructor. Expected a string."
			);

		this.code = code;
		this.message = message;
	}

	/**
	 * A regular JavaScript error with this error's message.
	 */
	get Error() {
		return new Error(this.message);
	}
}

/**
 * Validate an Article document.
 * @param {Object} article The article data to validate.
 * @throws {Error} An error is thrown if the article is not valid.
 * @returns {Object} The article data, reformatted, if necessary.
 */
export const validateArticle = async (article) => {
	if (!article.name)
		throw new ValidatorError(400, "No article name provided.");
	if (!article.author)
		throw new ValidatorError(400, "No author ID provided to article.");

	if (!article.alias) article.alias = nameToAlias(article.name);
	if (!article.content) article.content = "";
	if (!article.notes) article.notes = "";
	if (!article.featured) article.featured = false;
	if (!article.status) article.status = "unpublished";
	if (!article.hits) article.hits = 0;

	// Access
	// Category
	// Tags

	const existsWithAlias = await ArticleModel.findOne({
		alias: article.alias,
	});
	if (
		existsWithAlias &&
		(!article._id ||
			existsWithAlias._id.toString() !== article._id.toString())
	)
		throw new ValidatorError(
			404,
			"An article already exists with that alias."
		);

	article = await validateArticlePatch(article);

	return article;
};

/**
 * Validate an Article document patch. Unlike `validateArticle` this method simply validates each provided field, ignoring if a required field is unprovided.
 * @param {Object} article The article data to validate.
 * @throws {Error} An error is thrown if the data is not valid.
 * @returns {Object} The article data, reformatted if necessary.
 */
export const validateArticlePatch = async (article) => {
	if (
		article.name &&
		(typeof article.name !== "string" || !nameRegex.test(article.name))
	)
		throw new ValidatorError(400, "Invalid article name provided.");

	if (article.alias) {
		if (
			typeof article.alias !== "string" ||
			!aliasRegex.test(article.alias)
		)
			throw new ValidatorError(
				400,
				`Invalid article alias provided. Aliases must be 1-1024 characters of lowercase letters, numbers, underscores, and dashes only.`
			);

		const existsWithAlias = await ArticleModel.findOne({
			alias: article.alias,
		});
		if (
			existsWithAlias &&
			(!article._id ||
				existsWithAlias._id.toString() !== article._id.toString())
		)
			throw new ValidatorError(
				404,
				"An article already exists with that alias."
			);
	}

	if (article.author) {
		const author = await UserModel.findById(article.author);

		if (!author)
			throw new ValidatorError(404, "No author user found with that ID.");
	}

	if (article.content && typeof article.content !== "string")
		throw new ValidatorError(
			400,
			"Invalid article content provided. Expected a string."
		);

	if (article.notes && typeof article.notes !== "string")
		throw new ValidatorError(
			400,
			"Invalid article notes provided. Expected a string."
		);

	if (article.featured && typeof article.featured !== "boolean")
		throw new ValidatorError(
			400,
			'Invalid article "featured" status provided. Expected a boolean.'
		);

	// Access
	// Category
	// Tags

	if (article.status && !statusEnum.includes(article.status))
		throw new ValidatorError(
			400,
			`Invalid article status provided. Expected one of: ${statusEnum}`
		);

	if (
		article.hits &&
		(typeof article.hits !== "number" ||
			article.hits < 0 ||
			!Number.isInteger(article.hits))
	)
		throw new ValidatorError(
			400,
			"Invalid article hits count provided. Expected an integer above 0."
		);

	return article;
};

/**
 * Validate an Article filtration query object.
 * @param {Object} query The query data to validate.
 * @throws {Error} An error is thrown if the query data is not valid.
 * @returns {Object} The query data, reformatted, if necessary.
 */
export const validateArticleQuery = async (query) => {
	const {
		search = "",
		sortField = "createdAt",
		sortDir = "-1",
		status = "normal",
		page = "0",
		itemsPerPage = "20",
	} = query;

	if (typeof search !== "string")
		throw new ValidatorError(
			400,
			`Invalid "search" provided. Must be a string.`
		);

	if (status !== "normal" && !statusEnum.includes(status))
		throw new ValidatorError(
			400,

			`Invalid "status" provided. Must be either "normal" or one of: ${statusEnum}`
		);

	if (!sortEnum.includes(sortField))
		throw new ValidatorError(
			400,
			`Invalid "sortField" provided. Must be one of: ${sortEnum}`
		);
	if (sortDir !== "-1" && sortDir !== "1")
		throw new ValidatorError(
			400,
			'Invalid "sortDir" provided. Expected either "-1" or "1".'
		);

	if (isNaN(page) || !Number.isInteger(+page) || +page < 0)
		throw new ValidatorError(
			400,

			`Request "page" parameter must be an integer greater than 0.`
		);

	if (
		itemsPerPage !== "all" &&
		(isNaN(itemsPerPage) ||
			!Number.isInteger(+itemsPerPage) ||
			+itemsPerPage < 0)
	)
		throw new ValidatorError(
			400,

			`Request "itemsPerPage" parameter must be an integer greater than 0 or the string "all"`
		);

	return query;
};
