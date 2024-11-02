import mongoose from "mongoose";
import { aliasRegex } from "../util/regex.js";

const ArticleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Article name provided."],
		},
		alias: {
			type: String,
			required: [true, "No Article alias provided."],
			match: [aliasRegex, "Invalid alias provided to Article."],
		},
		content: {
			type: String,
			required: [true, "No content provided to Article."],
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Article", ArticleSchema);
