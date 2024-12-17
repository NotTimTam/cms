import { relativePathRegex } from "../../util/regex.js";
import mongoose from "mongoose";

const GlobalServerConfigurationCacheSchema = new mongoose.Schema(
	{
		use: {
			type: Boolean,
			required: false,
		},
		path: {
			type: String,
			required: [true, "No cache directory location provided."],
			match: relativePathRegex,
		},
	},
	{ _id: false }
);

export default GlobalServerConfigurationCacheSchema;
