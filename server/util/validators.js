import ArticleModel from "../models/content/ArticleModel.js";
import CategoryModel from "../models/content/CategoryModel.js";
import TagModel from "../models/content/TagModel.js";
import UserModel from "../models/users/UserModel.js";
import RoleModel from "../models/users/RoleModel.js";
import {
	aliasRegex,
	collectionNameRegex,
	emailRegex,
	nameRegex,
} from "../../util/regex.js";
import { nameToAlias } from "./alias.js";
import { robotsEnum, sortEnum, statusEnum } from "../../util/enum.js";
import { isBoolean } from "../../util/data.js";
import mongoose from "mongoose";
import { definitions } from "../../util/permissions.js";

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

	if (article.author) {
		const author = await UserModel.findById(article.author);

		if (!author) article.author = null;
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
 * Validate a Category document.
 * @param {Object} category The category data to validate.
 * @throws {Error} An error is thrown if the category is not valid.
 * @returns {Object} The category data, reformatted, if necessary.
 */
export const validateCategory = async (category) => {
	if (category.author) {
		const author = await UserModel.findById(category.author);

		if (!author) category.author = null;
	}

	if (!category.name) throw new ResError(400, "No category name provided.");
	else {
		if (typeof category.name !== "string" || !nameRegex.test(category.name))
			throw new ResError(
				400,
				`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
			);

		const existing = await CategoryModel.findOne({ name: category.name });

		if (
			existing &&
			(!category._id ||
				existing._id.toString() !== category._id.toString())
		)
			throw new ResError(
				422,
				"A category already exists with that name."
			);
	}

	if (!category.alias) category.alias = nameToAlias(category.name);
	else {
		if (
			typeof category.alias !== "string" ||
			!aliasRegex.test(category.alias)
		)
			throw new ResError(
				400,
				`Invalid category alias provided. Aliases must be 1-1024 characters of lowercase letters, numbers, underscores, and dashes only.`
			);
	}

	const existsWithAlias = await CategoryModel.findOne({
		alias: category.alias,
	});
	if (
		existsWithAlias &&
		(!category._id ||
			existsWithAlias._id.toString() !== category._id.toString())
	)
		throw new ResError(422, "A category already exists with that alias.");

	if (category.description && typeof category.description !== "string")
		throw new ResError(400, "Invalid description provided.");

	if (!category.notes) category.notes = "";
	else if (typeof category.notes !== "string")
		throw new ResError(
			400,
			"Invalid category notes provided. Expected a string."
		);

	if (
		category.order &&
		(typeof category.order !== "number" ||
			!Number.isInteger(category.order))
	)
		throw new ResError(
			400,
			"Invalid order value provided. Expected an integer."
		);

	if (category.hasOwnProperty("parent")) {
		if (category.parent === null) category.parent = undefined;
		else {
			const parentRole = await CategoryModel.findById(category.parent);

			if (!parentRole)
				throw new ResError(
					404,
					`No category found with id "${category.parent}"`
				);
		}
	}

	if (!category.status) category.status = "unpublished";
	else if (!statusEnum.includes(category.status))
		throw new ResError(
			400,
			`Invalid category status provided. Expected one of: ${statusEnum}`
		);

	if (!category.featured) category.featured = false;
	else if (typeof category.featured !== "boolean")
		throw new ResError(
			400,
			'Invalid category "featured" status provided. Expected a boolean.'
		);

	// Access
	// Tags

	return category;
};

/**
 * Validate a Tag document.
 * @param {Object} tag The tag data to validate.
 * @throws {Error} An error is thrown if the tag is not valid.
 * @returns {Object} The tag data, reformatted, if necessary.
 */
export const validateTag = async (tag) => {
	if (tag.author) {
		const author = await UserModel.findById(tag.author);

		if (!author) tag.author = null;
	}

	if (!tag.name) throw new ResError(400, "No tag name provided.");
	else {
		if (typeof tag.name !== "string" || !nameRegex.test(tag.name))
			throw new ResError(
				400,
				`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
			);

		const existing = await TagModel.findOne({ name: tag.name });

		if (
			existing &&
			(!tag._id || existing._id.toString() !== tag._id.toString())
		)
			throw new ResError(422, "A tag already exists with that name.");
	}

	if (!tag.alias) tag.alias = nameToAlias(tag.name);
	else {
		if (typeof tag.alias !== "string" || !aliasRegex.test(tag.alias))
			throw new ResError(
				400,
				`Invalid tag alias provided. Aliases must be 1-1024 characters of lowercase letters, numbers, underscores, and dashes only.`
			);
	}

	const existsWithAlias = await TagModel.findOne({
		alias: tag.alias,
	});
	if (
		existsWithAlias &&
		(!tag._id || existsWithAlias._id.toString() !== tag._id.toString())
	)
		throw new ResError(422, "A tag already exists with that alias.");

	if (
		tag.order &&
		(typeof tag.order !== "number" || !Number.isInteger(tag.order))
	)
		throw new ResError(
			400,
			"Invalid order value provided. Expected an integer."
		);

	if (tag.hasOwnProperty("parent")) {
		if (tag.parent === null) tag.parent = undefined;
		else {
			const parentRole = await TagModel.findById(tag.parent);

			if (!parentRole)
				throw new ResError(404, `No tag found with id "${tag.parent}"`);
		}
	}

	// Access

	return tag;
};

/**
 * Validate a Role document.
 * @param {Object} role The role data to validate.
 * @throws {Error} An error is thrown if the role is not valid.
 * @returns {Object} The role data, reformatted, if necessary.
 */
export const validateRole = async (role) => {
	if (!role.name) throw new ResError(400, "No role name provided.");
	else {
		if (typeof role.name !== "string" || !nameRegex.test(role.name))
			throw new ResError(
				400,
				`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
			);

		const existing = await RoleModel.findOne({ name: role.name });

		if (
			existing &&
			(!role._id || existing._id.toString() !== role._id.toString())
		)
			throw new ResError(422, "A role already exists with that name.");
	}

	if (role.description && typeof role.description !== "string")
		throw new ResError(400, "Invalid description provided.");

	if (
		role.order &&
		(typeof role.order !== "number" || !Number.isInteger(role.order))
	)
		throw new ResError(
			400,
			"Invalid order value provided. Expected an integer."
		);

	if (role.visible && typeof role.visible !== "boolean")
		throw new ResError(
			400,
			'Invalid "visible" state provided. Expected a boolean.'
		);

	if (role.protected && typeof role.protected !== "boolean")
		throw new ResError(
			400,
			'Invalid "protected" state provided. Expected a boolean.'
		);

	if (role.hasOwnProperty("parent")) {
		if (role.parent === null) role.parent = undefined;
		else {
			const parentRole = await RoleModel.findById(role.parent);

			if (!parentRole)
				throw new ResError(
					404,
					`No role found with id "${role.parent}"`
				);
		}
	}

	return role;
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
				"A user's role field must be an array of role ids."
			);

		for (const id of user.roles) {
			const role = await RoleModel.findById(id);

			if (!role) throw new ResError(404, `No role found with id "${id}"`);
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

	if (user.visible && typeof user.visible !== "boolean")
		throw new ResError(
			400,
			'Invalid "visible" state provided. Expected a boolean.'
		);

	if (user.protected && typeof user.protected !== "boolean")
		throw new ResError(
			400,
			'Invalid "protected" state provided. Expected a boolean.'
		);

	return user;
};

/**
 * Validate a Global Configuraiton document.
 * @param {Object} globalConfiguration The global configuration data to validate.
 * @throws {Error} An error is thrown if the global configuration is not valid.
 * @returns {Object} The global configuration data, reformatted, if necessary.
 */
export const validateGlobalConfiguration = async (globalConfiguration) => {
	// Site
	if (!globalConfiguration.site) {
		throw new ResError(400, `No site configuration provided.`);
	} else {
		if (
			!globalConfiguration.site.name ||
			typeof globalConfiguration.site.name !== "string" ||
			globalConfiguration.site.name.length < 1 ||
			globalConfiguration.site.name.length > 256
		)
			throw new ResError(
				400,
				"Invalid site name provided. Expected a string between 1 and 256 characters in length."
			);

		if (globalConfiguration.site.metadata) {
			if (
				globalConfiguration.site.metadata.hasOwnProperty("robots") &&
				!robotsEnum.includes(globalConfiguration.site.metadata.robots)
			)
				throw new ResError(
					400,
					`Invalid robots configuration provided. Expected one of: ${robotsEnum}`
				);

			if (
				globalConfiguration.site.metadata.hasOwnProperty(
					"showCMSVersion"
				) &&
				typeof globalConfiguration.site.metadata.showCMSVersion !==
					"boolean"
			)
				throw new ResError(
					400,
					"Invalid configuration for 'Show CMS Version' provided. Expected a boolean."
				);

			if (
				globalConfiguration.site.metadata.hasOwnProperty(
					"showAuthorMetaTag"
				) &&
				typeof globalConfiguration.site.metadata.showAuthorMetaTag !==
					"boolean"
			)
				throw new ResError(
					400,
					"Invalid configuration for 'Show Author Meta Tag' provided. Expected a boolean."
				);

			if (
				globalConfiguration.site.metadata.hasOwnProperty("author") &&
				typeof globalConfiguration.site.metadata.author !== "string"
			)
				throw new ResError(
					400,
					"Invalid site author provided. Expected a string."
				);

			if (
				globalConfiguration.site.metadata.hasOwnProperty(
					"description"
				) &&
				typeof globalConfiguration.site.metadata.description !==
					"string"
			)
				throw new ResError(
					400,
					"Invalid site description provided. Expected a string."
				);

			if (
				globalConfiguration.site.metadata.hasOwnProperty("keywords") &&
				typeof globalConfiguration.site.metadata.keywords !== "string"
			)
				throw new ResError(
					400,
					"Invalid site keywords provided. Expected a string."
				);
		}

		if (
			globalConfiguration.site.hasOwnProperty("offline") &&
			typeof globalConfiguration.site.offline !== "boolean"
		)
			throw new ResError(
				400,
				"Invalid site offline status provided. Expected a boolean."
			);
	}

	// Server
	if (!globalConfiguration.server) {
		throw new ResError(400, `No server configuration provided.`);
	} else {
		if (!globalConfiguration.server.cache)
			throw new ResError("No cache configuration provided.");
		else {
			if (
				globalConfiguration.server.cache.hasOwnProperty("use") &&
				typeof globalConfiguration.server.cache.use !== "boolean"
			)
				throw new ResError(
					400,
					"Invalid cache use configuration provided. Expected a boolean."
				);

			if (
				!globalConfiguration.server.cache.collection ||
				!collectionNameRegex.test(
					globalConfiguration.server.cache.collection
				)
			)
				throw new ResError(
					400,
					"Invalid cache collection name provided. Expected a 1-128 character string containing only letters, numbers, and underscores, but not starting with an underscore."
				);
		}

		if (globalConfiguration.server.webServices) {
			if (
				globalConfiguration.server.webServices.hasOwnProperty("cors") &&
				typeof globalConfiguration.server.webServices.cors !== "boolean"
			)
				throw new ResError(
					400,
					"Invalid cors configuration provided. Expected a boolean."
				);

			if (globalConfiguration.server.webServices.rateLimiter) {
				if (
					globalConfiguration.server.webServices.rateLimiter.hasOwnProperty(
						"use"
					) &&
					typeof globalConfiguration.server.webServices.rateLimiter
						.use !== "boolean"
				)
					throw new ResError(
						400,
						"Invalid rate limiter use configuration provided. Expected a boolean."
					);

				if (
					globalConfiguration.server.webServices.rateLimiter
						.interval &&
					(typeof globalConfiguration.server.webServices.rateLimiter
						.interval !== "number" ||
						globalConfiguration.server.webServices.rateLimiter
							.interval < 1)
				)
					throw new ResError(
						400,
						"Invalid rate limiter interval provided. Expected a number greater than or equal to 1."
					);

				if (
					globalConfiguration.server.webServices.rateLimiter
						.requests &&
					(typeof globalConfiguration.server.webServices.rateLimiter
						.requests !== "number" ||
						globalConfiguration.server.webServices.rateLimiter
							.requests < 1)
				)
					throw new ResError(
						400,
						"Invalid rate limiter requests provided. Expected a number greater than or equal to 1."
					);
			}
		}
	}

	//	Permissions
	if (globalConfiguration.permissions) {
		if (!(globalConfiguration.permissions instanceof Array))
			throw new ResError(
				400,
				`Invalid permissions provided. Expected an array of objects.`
			);

		for (const permissionConfig of globalConfiguration.permissions) {
			const role = await RoleModel.findById(permissionConfig.role);

			if (!role)
				throw new ResError(
					404,
					`No role with id "${permissionConfig.role}"`
				);

			if (permissionConfig.permissions) {
				if (!(permissionConfig.permissions instanceof Array))
					throw new ResError(
						400,
						"Invalid permissions provided. Expected an array of objects."
					);

				for (const permission of permissionConfig.permissions) {
					if (
						!permission.name ||
						!Object.keys(definitions).includes(permission.name)
					)
						throw new ResError(
							400,
							`Invalid permission name provided. Expected one of: ${Object.keys(
								definitions
							)}`
						);

					if (
						permission.status &&
						typeof permission.status !== "boolean"
					)
						throw new ResError(
							400,
							"Invalid permission status provided. Expected a boolean."
						);
				}
			}
		}
	}

	return globalConfiguration;
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

export const stripQuery = (query) => {
	const newQuery = {};

	if (query.status) {
		newQuery.status = {
			$in:
				query.status === "normal"
					? ["published", "unpublished"]
					: [query.status],
		};
	}

	if (query.search)
		newQuery["$or"] = [
			{ name: { $regex: query.search, $options: "i" } },
			{ alias: { $regex: query.search, $options: "i" } },
		];

	return newQuery;
};
