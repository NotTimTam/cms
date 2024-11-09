import mongoose from "mongoose";
import { aliasRegex, nameRegex } from "../../util/regex.js";

const MenuItemSchema = new mongoose.Schema(
	{
		menu: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Menu",
			required: [true, "No Menu provided to MenuItem."],
		},
		parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "MenuItem",
			required: false,
		},
		name: {
			type: String,
			required: [true, "No MenuItem name provided."],
			match: [nameRegex, "Invalid name provided to MenuItem."],
		},
		alias: {
			type: String,
			required: [true, "No MenuItem alias provided."],
			match: [aliasRegex, "Invalid alias provided to MenuItem."],
		},
	},
	{ timestamps: true }
);

export default mongoose.model("MenuItem", MenuItemSchema);
