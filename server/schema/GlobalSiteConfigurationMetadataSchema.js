import { robotsEnum } from "../../util/enum.js";
import mongoose from "mongoose";

const GlobalSiteConfigurationMetadataSchema = new mongoose.Schema(
	{
		robots: {
			type: String,
			required: false,
			enum: robotsEnum,
		},
		showCMSVersion: {
			type: Boolean,
			required: false,
			default: true,
		},
		showAuthorMetaTag: {
			type: Boolean,
			required: false,
			default: true,
		},
		author: {
			type: String,
			required: false,
		},
		description: {
			type: String,
			required: false,
		},
		keywords: {
			type: String,
			required: false,
		},
	},
	{ _id: false }
);

export default GlobalSiteConfigurationMetadataSchema;
