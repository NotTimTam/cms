import mongoose from "mongoose";
import { aliasRegex, nameRegex } from "../../../util/regex.js";
import { statusEnum } from "../../../util/enum.js";
import PermissionSchema from "../../schema/Permissions.js";

const ArticleSchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
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
		notes: {
			type: String,
			required: false,
			default: "",
			select: false,
		},
		featured: {
			type: Boolean,
			required: [true, "Article featured status not provided."],
			default: false,
		},
		// access: [{
		// 	type: mongoose.Schema.Types.ObjectId,
		// 	ref
		// }],
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: false,
		},
		tags: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Tag",
				required: false,
			},
		],
		status: {
			type: String,
			enum: statusEnum,
			select: false,
			required: [true, "You must provide the Article's status."],
			default: "unpublished",
		},
		hits: {
			type: Number,
			required: [
				true,
				"You must provide the hit count for this Article.",
			],
			default: 0,
			min: 0,
		},
		order: {
			type: Number,
			required: [
				true,
				"You must provide order placement for this Article.",
			],
			default: 0,
		},
		permissions: [
			{
				type: PermissionSchema,
				required: false,
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Article", ArticleSchema);
