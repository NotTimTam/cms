import mongoose from "mongoose";
import actions from "../../util/permissions.js";
import PermissionSchema from "./Permissions.js";

const PermissionGroupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Permission Group name provided."],
			enum: Object.keys(actions),
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
