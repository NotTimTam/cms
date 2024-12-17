import mongoose from "mongoose";

const GlobalServerConfigurationWebServicesRateLimiterSchema =
	new mongoose.Schema(
		{
			use: {
				type: Boolean,
				required: false,
			},
			interval: {
				type: Number,
				required: false,
				min: [
					1,
					"Request memory interval must be at least 1 millisecond.",
				],
			},
			requests: {
				type: Number,
				required: false,
				min: [1, "Requests per interval must be greater than 0."],
			},
		},
		{ _id: false }
	);

export default GlobalServerConfigurationWebServicesRateLimiterSchema;
