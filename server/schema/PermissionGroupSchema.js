import mongoose from "mongoose";
import allPermissions from "../../util/permissions.js";
import PermissionSchema from "./PermissionSchema.js";

const PermissionGroupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Permission Group name provided."],
			enum: allPermissions.map((permission) => permission.name),
		},
		permissions: [
			{
				type: PermissionSchema,
				required: false,
			},
		],
	},
	{ timestamps: true, _id: false }
);

export default PermissionGroupSchema;
