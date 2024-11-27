import mongoose from "mongoose";
import { nameRegex } from "../../../util/regex.js";
import PermissionSchema from "../../schema/Permissions.js";

const MenuSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Menu name provided."],
			match: [nameRegex, "Invalid name provided to Menu."],
		},
		permissions: [
			{
				type: PermissionSchema,
				required: false,
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Menu", MenuSchema);
