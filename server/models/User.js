import mongoose from "mongoose";
import { emailRegex } from "../util/regex";

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No name provided to User."],
		},
		username: {
			type: String,
			required: [true, "No username provided to User."],
			unique: [true, 'User "username" field must be unique.'],
		},
		password: {
			type: String,
			required: [true, "No password provided to User."],
			select: false,
		},
		email: {
			type: String,
			required: false,
			match: [emailRegex, "Invalid email address provided to User."],
		},
		groups: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "UserGroup",
				required: false,
			},
		],
		verified: {
			type: Boolean,
			default: false,
			required: [
				true,
				"You must provide the User's verification status.",
			],
		},
	},
	{ timestamps: true }
);

export default mongoose.model("User", UserSchema);
