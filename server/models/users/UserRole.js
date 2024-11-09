import mongoose from "mongoose";
import { nameRegex } from "../../../util/regex.js";

const UserRoleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No UserRole name provided."],
			match: [nameRegex, "Invalid name provided to UserRole."],
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
	},
	{ timestamps: true }
);

export default mongoose.model("UserRole", UserRoleSchema);
