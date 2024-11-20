import ArticleModel from "../models/content/Article.js";
import UserModel from "../models/users/User.js";
import UserRoleModel from "../models/users/UserRole.js";
import { aliasRegex, emailRegex, nameRegex } from "../../util/regex.js";
import { nameToAlias } from "./alias.js";
import { sortEnum, statusEnum } from "../../util/enum.js";
import { isBoolean } from "../../util/data.js";
import mongoose from "mongoose";

export class ResError {
	constructor(code, message) {
		if (typeof code !== "number")
			throw new TypeError(
				"Invalid code value provided to ResError constructor. Expected a number."
			);
		if (typeof message !== "string")
			throw new TypeError(
				"Invalid message value provided to ResError constructor. Expected a string."
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
	if (!article.name) throw new ResError(400, "No article name provided.");
	else if (typeof article.name !== "string" || !nameRegex.test(article.name))
		throw new ResError(400, "Invalid article name provided.");

	if (!article.author)
		throw new ResError(400, "No author ID provided to article.");
	else {
		const author = await UserModel.findById(article.author);

		if (!author)
			throw new ResError(404, "No author user found with that ID.");
	}

	if (!article.alias) article.alias = nameToAlias(article.name);
	else {
		if (
			typeof article.alias !== "string" ||
			!aliasRegex.test(article.alias)
		)
			throw new ResError(
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
		throw new ResError(422, "An article already exists with that alias.");

	if (!article.content) article.content = "";
	else if (typeof article.content !== "string")
		throw new ResError(
			400,
			"Invalid article content provided. Expected a string."
		);

	if (!article.notes) article.notes = "";
	else if (typeof article.notes !== "string")
		throw new ResError(
			400,
			"Invalid article notes provided. Expected a string."
		);

	if (!article.featured) article.featured = false;
	else if (typeof article.featured !== "boolean")
		throw new ResError(
			400,
			'Invalid article "featured" status provided. Expected a boolean.'
		);

	if (!article.status) article.status = "unpublished";
	else if (!statusEnum.includes(article.status))
		throw new ResError(
			400,
			`Invalid article status provided. Expected one of: ${statusEnum}`
		);

	if (!article.hits) article.hits = 0;
	else if (
		typeof article.hits !== "number" ||
		article.hits < 0 ||
		!Number.isInteger(article.hits)
	)
		throw new ResError(
			400,
			"Invalid article hits count provided. Expected an integer above 0."
		);

	if (
		article.order &&
		(typeof article.order !== "number" || !Number.isInteger(article.order))
	)
		throw new ResError(
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
	if (!userRole.name) throw new ResError(400, "No role name provided.");
	else {
		if (typeof userRole.name !== "string" || !nameRegex.test(userRole.name))
			throw new ResError(
				400,
				`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
			);

		const existing = await UserRoleModel.findOne({ name: userRole.name });

		if (
			existing &&
			(!userRole._id ||
				existing._id.toString() !== userRole._id.toString())
		)
			throw new ResError(
				422,
				"A user role already exists with that name."
			);
	}

	if (userRole.description && typeof userRole.description !== "string")
		throw new ResError(400, "Invalid description provided.");

	if (
		userRole.order &&
		(typeof userRole.order !== "number" ||
			!Number.isInteger(userRole.order))
	)
		throw new ResError(
			400,
			"Invalid order value provided. Expected an integer."
		);

	if (userRole.locked && typeof userRole.locked !== "boolean")
		throw new ResError(
			400,
			'Invalid "locked" state provided. Expected a boolean.'
		);

	if (userRole.hasOwnProperty("parent")) {
		if (userRole.parent === null) userRole.parent = undefined;
		else {
			const parentRole = await UserRoleModel.findById(userRole.parent);

			if (!parentRole)
				throw new ResError(
					404,
					`No user role found with id "${userRole.parent}"`
				);
		}
	}

	return userRole;
};

/**
 * Validate a User document.
 * @param {Object} user The user data to validate.
 * @throws {Error} An error is thrown if the user is not valid.
 * @returns {Object} The user data, reformatted, if necessary.
 */
export const validateUser = async (user) => {
	if (!user.name) throw new ResError(400, "No name provided to user.");
	else if (typeof user.name !== "string" || !nameRegex.test(user.name))
		throw new ResError(
			400,
			`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
		);

	if (!user.username) throw new ResError(400, "No username provided.");
	else {
		const existing = await UserModel.findOne({ username: user.username });

		if (
			existing &&
			(!user._id || existing._id.toString() !== user._id.toString())
		)
			throw new ResError(
				422,
				"A user already exists with that username."
			);
	}

	if (!user.password || typeof user.password !== "string")
		throw new ResError(400, "No password string provided.");

	if (user.email) {
		if (typeof user.email !== "string" || !emailRegex.test(user.email))
			throw new ResError(400, "Invalid email address provided.");

		const existing = await UserModel.findOne({ email: user.email });

		if (
			existing &&
			(!user._id || existing._id.toString() !== user._id.toString())
		)
			throw new ResError(
				422,
				"A user already exists with that email address."
			);
	}

	if (user.roles) {
		if (!(user.roles instanceof Array))
			throw new ResError(
				400,
				"A user's role field must be an array of user role ids."
			);

		for (const id of user.roles) {
			const userRole = await UserRoleModel.findById(id);

			if (!userRole)
				throw new ResError(404, `No user role found with id "${id}"`);
		}
	}

	if (user.hasOwnProperty("verified") && !isBoolean(user.verified))
		throw new ResError(400, "User verification status must be a boolean.");
	else if (!user.hasOwnProperty("verified")) user.verified = false;

	if (
		user.jwtTimestamp &&
		!(user.jwtTimestamp instanceof Date) &&
		isNaN(new Date(user.jwtTimestamp).getTime())
	)
		throw new ResError(400, 'Invalid "jwtTimestamp" provided.');

	return user;
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
		throw new ResError(400, `Invalid "search" provided. Must be a string.`);

	if (!sortEnum.includes(sortField))
		throw new ResError(
			400,
			`Invalid "sortField" provided. Must be one of: ${sortEnum}`
		);
	if (sortDir !== "-1" && sortDir !== "1")
		throw new ResError(
			400,
			'Invalid "sortDir" provided. Expected either "-1" or "1".'
		);

	if (isNaN(page) || !Number.isInteger(+page) || +page < 0)
		throw new ResError(
			400,

			`Request "page" parameter must be an integer greater than 0.`
		);

	if (
		itemsPerPage !== "all" &&
		(isNaN(itemsPerPage) ||
			!Number.isInteger(+itemsPerPage) ||
			+itemsPerPage < 0)
	)
		throw new ResError(
			400,

			`Request "itemsPerPage" parameter must be an integer greater than 0 or the string "all"`
		);

	return query;
};

/**
 * Validate a filtration query object used for filtering through documents that have a nested parent/child system.
 * @param {Object} query The query data to validate.
 * @throws {Error} An error is thrown if the query data is not valid.
 * @returns {Object} The query data, reformatted, if necessary.
 */
export const validateNestQuery = async (query) => {
	query = await validateGenericQuery(query);

	if (query.root && !mongoose.Types.ObjectId.isValid(query.root))
		throw new ResError(
			400,
			'Invalid query "root" parameter. Expected an object id.'
		);

	if (query.depth) {
		query.depth = +query.depth;
		if (isNaN(depth) || query.depth < 0 || !Number.isInteger(query.depth))
			throw new ResError(
				400,
				'Invalid query "depth" parameter. Expected an integer >= 0.'
			);
	}

	return query;
};

/**
 * Validate a filtration query object used for filtering through users.
 * @param {Object} query The query data to validate.
 * @throws {Error} An error is thrown if the query data is not valid.
 * @returns {Object} The query data, reformatted, if necessary.
 */
export const validateUserQuery = async (query) => {
	query = await validateGenericQuery(query);

	if (query.role && !mongoose.Types.ObjectId.isValid(query.role))
		throw new ResError(
			400,
			'Invalid query "role" parameter. Expected an object id.'
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
		throw new ResError(
			400,

			`Invalid "status" provided. Must be either "normal" or one of: ${statusEnum}`
		);

	return query;
};
