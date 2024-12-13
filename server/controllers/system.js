import { handleUnexpectedError } from "../util/controller.js";

/**
 * Trigger a server reboot.
 */
export const shutdown = async (req, res) => {
	try {
		process.exit(0);
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
