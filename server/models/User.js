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
	},
	{ timestamps: true }
);

export default mongoose.model("User", UserSchema);
