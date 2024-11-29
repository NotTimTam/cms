import mongoose from "mongoose";
import PermissionGroupSchema from "./PermissionGroup.js";

const RolePermissionGroupsSchema = new mongoose.Schema(
	{
		role: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
		},
		groups: [
			{
				type: PermissionGroupSchema,
				required: false,
			},
		],
	},
	{ timestamps: true, _id: false }
);

export default RolePermissionGroupsSchema;
