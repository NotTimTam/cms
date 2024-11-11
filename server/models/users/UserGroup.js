import mongoose from "mongoose";
import { nameRegex } from "../../../util/regex.js";

const UserGroupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No UserGroup name provided."],
			match: [nameRegex, "Invalid name provided to UserGroup."],
			unique: [true, "UserGroup name must be unique."],
		},
		description: {
			type: String,
			required: false,
		},
		roles: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "UserRole",
				required: false,
			},
		],
		parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "UserGroup",
			required: false,
		},
		order: {
			type: Number,
			required: [
				true,
				"You must provide order placement for this UserGroup.",
			],
			default: 0,
		},
		locked: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("UserGroup", UserGroupSchema);
