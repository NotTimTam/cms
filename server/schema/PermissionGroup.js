import mongoose from "mongoose";
import ComponentPermissions from "../../util/permissions.js";
import PermissionSchema from "./Permission.js";

const PermissionGroupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Permission Group name provided."],
			enum: ComponentPermissions.map(
				(componentPermission) => componentPermission.name
			),
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
