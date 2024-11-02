import mongoose from "mongoose";
import { aliasRegex, nameRegex } from "../util/regex.js";

const ArticleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Article name provided."],
			match: [nameRegex, "Invalid name provided to Article."],
		},
		alias: {
			type: String,
			required: [true, "No Article alias provided."],
			match: [aliasRegex, "Invalid alias provided to Article."],
			unique: [true, "Article alias must be unique."],
		},
		content: {
			type: String,
			required: false,
			default: "",
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Article", ArticleSchema);
