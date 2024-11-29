import mongoose from "mongoose";
import { aliasRegex, nameRegex } from "../../../util/regex.js";
import { statusEnum } from "../../../util/enum.js";
import RolePermissionGroupsSchema from "../../schema/RolePermissionGroups.js";

const CategorySchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
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
		notes: {
			type: String,
			required: false,
			default: "",
			select: false,
		},
		description: {
			type: String,
			required: false,
		},
		order: {
			type: Number,
			required: [
				true,
				"You must provide order placement for this Category.",
			],
			default: 0,
		},
		status: {
			type: String,
			enum: statusEnum,
			select: false,
			required: [true, "You must provide the Category's status."],
			default: "unpublished",
		},
		featured: {
			type: Boolean,
			required: [true, "Category featured status not provided."],
			default: false,
		},
		tags: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Tag",
				required: false,
			},
		],
		parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: false,
		},
		permissions: [
			{
				type: RolePermissionGroupsSchema,
				required: false,
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
