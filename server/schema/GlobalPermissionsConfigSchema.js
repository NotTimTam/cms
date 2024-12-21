import mongoose from "mongoose";
import RolePermissionGroupsSchema from "./RolePermissionGroupsSchema.js";

const GlobalPermissionsConfigSchema = new mongoose.Schema(
	{
		system: [
			{
				type: RolePermissionGroupsSchema,
				required: false,
			},
		],
	},
	{ _id: false }
);

export default GlobalPermissionsConfigSchema;
