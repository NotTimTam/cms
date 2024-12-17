import mongoose from "mongoose";
import GlobalServerConfigurationWebServicesRateLimiterSchema from "./GlobalServerConfigurationWebServicesRateLimiterSchema.js";

const GlobalServerConfigurationWebServicesSchema = new mongoose.Schema(
	{
		cors: {
			type: Boolean,
			required: false,
		},
		rateLimiter: {
			type: GlobalServerConfigurationWebServicesRateLimiterSchema,
			required: false,
		},
	},
	{ _id: false }
);

export default GlobalServerConfigurationWebServicesSchema;
