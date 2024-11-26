import mongoose from "mongoose";
import { aliasRegex, nameRegex } from "../../../util/regex.js";

const TagSchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "You must provide the Tag's author."],
		},
		name: {
			type: String,
			required: [true, "No Tag name provided."],
			match: [nameRegex, "Invalid name provided to Tag."],
		},
		alias: {
			type: String,
			required: [true, "No Tag alias provided."],
			match: [aliasRegex, "Invalid alias provided to Tag."],
			unique: [true, "Tag alias must be unique."],
		},
		parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Tag",
			required: false,
		},
		order: {
			type: Number,
			required: [true, "You must provide order placement for this Tag."],
			default: 0,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Tag", TagSchema);
