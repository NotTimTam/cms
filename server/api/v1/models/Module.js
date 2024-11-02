import mongoose from "mongoose";
import { aliasRegex } from "../util/regex.js";

const ModuleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Module name provided."],
		},
		alias: {
			type: String,
			required: [true, "No Module alias provided."],
			match: [aliasRegex, "Invalid alias provided to Module."],
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Module", ModuleSchema);
