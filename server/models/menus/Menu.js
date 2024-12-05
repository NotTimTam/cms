import mongoose from "mongoose";
import { nameRegex } from "../../../util/regex.js";
import ComponentPermissionGroupsSchema from "../../schema/ComponentPermissionGroups.js";

const MenuSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Menu name provided."],
			match: [nameRegex, "Invalid name provided to Menu."],
		},
		permissions: [
			{
				type: ComponentPermissionGroupsSchema,
				required: false,
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Menu", MenuSchema);
