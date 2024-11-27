import mongoose from "mongoose";
import { nameRegex } from "../../../util/regex.js";
import PermissionSchema from "../../schema/Permissions.js";

const RoleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Role name provided."],
			match: [nameRegex, "Invalid name provided to Role."],
			unique: [true, "Role name must be unique."],
		},
		description: {
			type: String,
			required: false,
		},
		order: {
			type: Number,
			required: [true, "You must provide order placement for this Role."],
			default: 0,
		},
		parent: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Role",
			required: false,
		},
		locked: {
			type: Boolean,
			required: false,
			default: false,
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

export default mongoose.model("Role", RoleSchema);
