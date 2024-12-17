import { messageTypeEnum } from "../../../util/enum.js";
import UserModel from "../../models/users/UserModel.js";
import RoleModel from "../../models/users/RoleModel.js";

class SystemMessage {
	constructor(type, content) {
		if (!content || typeof content !== "string")
			throw new TypeError("SystemMessage content must be a string.");
		if (!messageTypeEnum.includes(type))
			throw new Error("Invalid SystemMessage type.");

		this.type = type;
		this.content = content;
	}
}

/**
 * Get system messages.
 */
export const getSystemMessages = async (req, res) => {
	try {
		const query = {};

		// Unverified users can only access non-confidential messages.
		if (!req.user) query.confidential = false;

		const systemMessages = [];

		// Check webmaster.
		const webmasterRole = await RoleModel.findOne({
			name: "Webmaster",
		});
		const webmaster = await UserModel.findOne({
			roles: { $in: [webmasterRole._id] },
		});

		if (webmaster && !webmaster.verified) {
			systemMessages.push(
				new SystemMessage(
					"warning",
					"An unverified webmaster user exists in the database. Check the server logs for credentials and login as the webmaster to change the password immediately."
				)
			);
		}

		return res.status(200).json({
			systemMessages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
