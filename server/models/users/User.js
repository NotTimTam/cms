import mongoose from "mongoose";
import { emailRegex, nameRegex } from "../../../util/regex.js";

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No name provided to User."],
			match: [nameRegex, "Invalid name provided to User."],
		},
		username: {
			type: String,
			required: [true, "No username provided to User."],
			unique: [true, 'User "username" field must be unique.'],
			match: [nameRegex, "Invalid username provided to User."],
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
			unique: [true, 'User "email" field must be unique.'],
			sparse: true,
		},
		roles: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "UserRole",
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

		jwtTimestamp: {
			type: Date,
			required: false,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("User", UserSchema);
