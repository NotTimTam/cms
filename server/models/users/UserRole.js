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
	},
	{ timestamps: true }
);

export default mongoose.model("UserRole", UserRoleSchema);
