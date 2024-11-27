import mongoose from "mongoose";
import { aliasRegex, nameRegex } from "../../util/regex.js";
import PermissionSchema from "../schema/Permissions.js";

const ModuleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Module name provided."],
			match: [nameRegex, "Invalid name provided to Module."],
		},
		alias: {
			type: String,
			required: [true, "No Module alias provided."],
			match: [aliasRegex, "Invalid alias provided to Module."],
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

export default mongoose.model("Module", ModuleSchema);
