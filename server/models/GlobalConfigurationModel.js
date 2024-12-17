import mongoose from "mongoose";
import GlobalSiteConfigurationSchema from "../schema/GlobalSiteConfigurationSchema.js";
import GlobalServerConfigurationSchema from "../schema/GlobalServerConfigurationSchema.js";
import GlobalPermissionsConfigSchema from "../schema/GlobalPermissionsConfigSchema.js";

const GlobalConfigurationSchema = new mongoose.Schema(
	{
		site: {
			type: GlobalSiteConfigurationSchema,
			required: [true, "No site configuration provided."],
		},
		server: {
			type: GlobalServerConfigurationSchema,
			required: [true, "No server configuration provided."],
		},
		permissions: [
			{
				type: GlobalPermissionsConfigSchema,
				required: false,
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model("GlobalConfiguration", GlobalConfigurationSchema);
