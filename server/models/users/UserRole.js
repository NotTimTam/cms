import mongoose from "mongoose";
import { nameRegex } from "../../../util/regex.js";

const UserRoleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No UserRole name provided."],
			match: [nameRegex, "Invalid name provided to UserRole."],
			unique: [true, "UserRole name must be unique."],
		},
		description: {
			type: String,
			required: false,
		},
		order: {
			type: Number,
			required: [
				true,
				"You must provide order placement for this UserRole.",
			],
			default: 0,
		},
		parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "UserRole",
			required: false,
		},
		locked: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("UserRole", UserRoleSchema);
