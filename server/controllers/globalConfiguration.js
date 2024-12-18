import GlobalConfigurationModel from "../models/GlobalConfigurationModel.js";
import { handleUnexpectedError } from "../util/controller.js";
import { stripMongoDBFieldsFromBody } from "../util/data.js";
import { ResError, validateGlobalConfiguration } from "../util/validators.js";

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

/**
 * Update the global configuration.
 */
export const updateGlobalConfiguration = async (req, res) => {
	try {
		const globalConfiguration = await GlobalConfigurationModel.findOne({});

		if (!globalConfiguration)
			return res.status(404).send("No global configuration found.");

		try {
			req.body = await validateGlobalConfiguration({
				...(await GlobalConfigurationModel.findOne({}).lean()),
				...stripMongoDBFieldsFromBody(req.body),
			});
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		// Store new values.
		for (const [key, value] of Object.entries(req.body)) {
			globalConfiguration[key] = value;
		}

		await globalConfiguration.save();

		return res.status(200).json({ globalConfiguration });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
