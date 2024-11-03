import mongoose from "mongoose";
import { nameRegex } from "../../util/regex.js";

const MenuSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Menu name provided."],
			match: [nameRegex, "Invalid name provided to Menu."],
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Menu", MenuSchema);
