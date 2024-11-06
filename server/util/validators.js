import ArticleModel from "../models/Article.js";
import UserModel from "../models/User.js";
import { aliasRegex, nameRegex } from "../../util/regex.js";
import { nameToAlias } from "./alias.js";
import { statusEnum } from "../../util/enum.js";

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
 * @returns {Object} The article data, reformatted.
 */
export const validateArticle = async (article) => {
	if (!article.name)
		throw new ValidatorError(400, "No article name provided.");

	if (typeof article.name !== "string" || !nameRegex.test(article.name))
		throw new ValidatorError(400, "Invalid article name provided.");

	if (!article.alias) article.alias = nameToAlias(article.name);
	else if (
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

	if (!article.author)
		throw new ValidatorError(400, "No author ID provided to article.");

	const author = await UserModel.findById(article.author);

	if (!author)
		throw new ValidatorError(404, "No author user found with that ID.");

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

	// Access
	// Category
	// Tags

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

	return article;
};
