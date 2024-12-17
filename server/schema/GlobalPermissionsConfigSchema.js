import mongoose from "mongoose";
import PermissionSchema from "./PermissionSchema.js";

const GlobalPermissionsConfigSchema = new mongoose.Schema(
	{
		role: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, "No user role id provided."],
			ref: "Role",
		},
		permissions: [
			{
				type: PermissionSchema,
				required: false,
			},
		],
	},
	{ _id: false }
);

export default GlobalPermissionsConfigSchema;
