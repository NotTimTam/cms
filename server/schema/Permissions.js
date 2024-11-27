import mongoose from "mongoose";
import { definitions } from "../util/permissions.js";

const PermissionSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Permission name provided."],
			enum: Object.keys(definitions),
		},
		status: {
			type: Boolean,
			required: false,
		},
	},
	{ timestamps: true }
);

export default PermissionSchema;
