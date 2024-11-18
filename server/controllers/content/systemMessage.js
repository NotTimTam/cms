import SystemMessageModel from "../../models/content/SystemMessage.js";

/**
 * Query system messages.
 */
export const findSystemMessages = async (req, res) => {
	try {
		const query = {};

		// Unverified users can only access non-confidential messages.
		if (!req.user) query.confidential = false;

		const systemMessages = await SystemMessageModel.find(query);

		return res.status(200).json({
			systemMessages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
