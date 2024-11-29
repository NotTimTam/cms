import mongoose from "mongoose";
import { nameRegex } from "../../../util/regex.js";
import RolePermissionGroupsSchema from "../../schema/RolePermissionGroups.js";

const MenuSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Menu name provided."],
			match: [nameRegex, "Invalid name provided to Menu."],
		},
		permissions: [
			{
				type: RolePermissionGroupsSchema,
				required: false,
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Menu", MenuSchema);
