import mongoose from "mongoose";
import GlobalSiteConfigurationMetadataSchema from "./GlobalSiteConfigurationMetadataSchema.js";

const GlobalSiteConfigurationSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			maxLength: [256, "Maximum site name length is 256 characters."],
			minLength: [1, "Minimum site name length is 1 character."],
		},
		metadata: {
			type: GlobalSiteConfigurationMetadataSchema,
			required: false,
		},
		offline: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	{ _id: false }
);

export default GlobalSiteConfigurationSchema;
