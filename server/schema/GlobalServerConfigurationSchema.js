import { relativePathRegex } from "../../util/regex.js";
import mongoose from "mongoose";
import GlobalServerConfigurationCacheSchema from "./GlobalServerConfigurationCacheSchema.js";
import GlobalServerConfigurationWebServicesSchema from "./GlobalServerConfigurationWebServicesSchema.js";

const GlobalServerConfigurationSchema = new mongoose.Schema(
	{
		cache: {
			type: GlobalServerConfigurationCacheSchema,
			required: [true, "No cache configuration provided."],
		},
		temp: {
			type: String,
			required: [true, "No temp directory location provided."],
			match: relativePathRegex,
		},
		webServices: {
			type: GlobalServerConfigurationWebServicesSchema,
			required: false,
		},
	},
	{ _id: false }
);

export default GlobalServerConfigurationSchema;