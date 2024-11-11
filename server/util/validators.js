import ArticleModel from "../models/content/Article.js";
import UserModel from "../models/users/User.js";
import UserRoleModel from "../models/users/UserRole.js";
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
	else if (typeof article.name !== "string" || !nameRegex.test(article.name))
		throw new ValidatorError(400, "Invalid article name provided.");

	if (!article.author)
		throw new ValidatorError(400, "No author ID provided to article.");
	else {
		const author = await UserModel.findById(article.author);

		if (!author)
			throw new ValidatorError(404, "No author user found with that ID.");
	}

	if (!article.alias) article.alias = nameToAlias(article.name);
	else {
		if (
			typeof article.alias !== "string" ||
			!aliasRegex.test(article.alias)
		)
			throw new ValidatorError(
				400,
				`Invalid article alias provided. Aliases must be 1-1024 characters of lowercase letters, numbers, underscores, and dashes only.`
			);
	}

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

	if (!article.content) article.content = "";
	else if (typeof article.content !== "string")
		throw new ValidatorError(
			400,
			"Invalid article content provided. Expected a string."
		);

	if (!article.notes) article.notes = "";
	else if (typeof article.notes !== "string")
		throw new ValidatorError(
			400,
			"Invalid article notes provided. Expected a string."
		);

	if (!article.featured) article.featured = false;
	else if (typeof article.featured !== "boolean")
		throw new ValidatorError(
			400,
			'Invalid article "featured" status provided. Expected a boolean.'
		);

	if (!article.status) article.status = "unpublished";
	else if (!statusEnum.includes(article.status))
		throw new ValidatorError(
			400,
			`Invalid article status provided. Expected one of: ${statusEnum}`
		);

	if (!article.hits) article.hits = 0;
	else if (
		typeof article.hits !== "number" ||
		article.hits < 0 ||
		!Number.isInteger(article.hits)
	)
		throw new ValidatorError(
			400,
			"Invalid article hits count provided. Expected an integer above 0."
		);

	if (
		article.order &&
		(typeof article.order !== "number" || !Number.isInteger(article.order))
	)
		throw new ValidatorError(
			400,
			"Invalid order value provided. Expected an integer."
		);

	// Access
	// Category
	// Tags

	return article;
};

/**
 * Validate a UserRole document.
 * @param {Object} userRole The user role data to validate.
 * @throws {Error} An error is thrown if the user role is not valid.
 * @returns {Object} The user role data, reformatted, if necessary.
 */
export const validateUserRole = async (userRole) => {
	if (!userRole.name) throw new ValidatorError(400, "No role name provided.");
	else {
		if (typeof userRole.name !== "string" || !nameRegex.test(userRole.name))
			throw new ValidatorError(
				400,
				`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
			);

		const existing = await UserRoleModel.findOne({ name: userRole.name });

		if (
			existing &&
			(!userRole._id ||
				existing._id.toString() !== userRole._id.toString())
		)
			throw new ValidatorError(
				400,
				"A user role already exists with that name."
			);
	}

	if (userRole.description && typeof userRole.description !== "string")
		throw new ValidatorError(400, "Invalid description provided.");

	if (
		userRole.order &&
		(typeof userRole.order !== "number" ||
			!Number.isInteger(userRole.order))
	)
		throw new ValidatorError(
			400,
			"Invalid order value provided. Expected an integer."
		);

	if (userRole.locked && typeof userRole.locked !== "boolean")
		throw new ValidatorError(
			400,
			'Invalid "locked" state provided. Expected a boolean.'
		);

	return userRole;
};

/**
 * Validate a filtration query object.
 * @param {Object} query The query data to validate.
 * @throws {Error} An error is thrown if the query data is not valid.
 * @returns {Object} The query data, reformatted, if necessary.
 */
export const validateGenericQuery = async (query) => {
	const {
		search = "",
		sortField = "createdAt",
		sortDir = "-1",
		page = "0",
		itemsPerPage = "20",
	} = query;

	if (typeof search !== "string")
		throw new ValidatorError(
			400,
			`Invalid "search" provided. Must be a string.`
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

/**
 * Validate an Article filtration query object.
 * @param {Object} query The query data to validate.
 * @throws {Error} An error is thrown if the query data is not valid.
 * @returns {Object} The query data, reformatted, if necessary.
 */
export const validateArticleQuery = async (query) => {
	query = await validateGenericQuery(query);

	const { status = "normal" } = query;

	if (status !== "normal" && !statusEnum.includes(status))
		throw new ValidatorError(
			400,

			`Invalid "status" provided. Must be either "normal" or one of: ${statusEnum}`
		);

	return query;
};
