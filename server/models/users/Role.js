import mongoose from "mongoose";
import { nameRegex } from "../../../util/regex.js";
import PermissionGroupSchema from "../../schema/PermissionGroup.js";

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
		protected: {
			type: Boolean,
			required: false,
			default: false,
		},
		visible: {
			type: Boolean,
			required: false,
			default: true,
		},
		permissionGroups: [
			{
				type: PermissionGroupSchema,
				required: false,
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("Role", RoleSchema);
