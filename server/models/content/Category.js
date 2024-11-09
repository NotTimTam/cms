import mongoose from "mongoose";
import { aliasRegex, nameRegex } from "../../../util/regex.js";

const CategorySchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "You must provide the Category's author."],
		},
		name: {
			type: String,
			required: [true, "No Category name provided."],
			match: [nameRegex, "Invalid name provided to Category."],
		},
		alias: {
			type: String,
			required: [true, "No Category alias provided."],
			match: [aliasRegex, "Invalid alias provided to Category."],
			unique: [true, "Category alias must be unique."],
		},
		description: {
			type: String,
			required: false,
		},
		parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: false,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
