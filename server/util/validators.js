import ArticleModel from "../models/Article.js";
import { aliasRegex, nameRegex } from "../../util/regex.js";
import { nameToAlias } from "./alias.js";

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

	if (await ArticleModel.findOne({ alias: article.alias }))
		throw new ValidatorError(
			404,
			"An article already exists with that alias."
		);

	return article;
};
