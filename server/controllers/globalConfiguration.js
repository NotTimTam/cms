import GlobalConfigurationModel from "../models/GlobalConfigurationModel.js";
import { handleUnexpectedError } from "../util/controller.js";

/**
 * Get the global configuration.
 */
export const getGlobalConfiguration = async (req, res) => {
	try {
		const globalConfiguration = await GlobalConfigurationModel.findOne({});

		if (!globalConfiguration)
			return res.status(404).send("No global configuration found.");

		return res.status(200).json({ globalConfiguration });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
