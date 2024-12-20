import { collectionNameRegex } from "../../util/regex.js";
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
			match: [
				collectionNameRegex,
				"Cache name must be a string between 1 and 128 characters. Consisting of letters, numbers, and underscores. But not starting with an underscore.",
			],
		},
	},
	{ _id: false }
);

export default GlobalServerConfigurationCacheSchema;
