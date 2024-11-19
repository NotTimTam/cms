import { error, log, success, warn } from "@nottimtam/console.js";
import bcrypt from "bcryptjs";
import UserRoleModel from "../models/users/UserRole.js";
import UserModel from "../models/users/User.js";
import SystemMessageModel from "../models/content/SystemMessage.js";
import { generateRandomPassword } from "../../util/data.js";

/**
 * Ensure that a webmaster exists, and create one if it does not.
 */
export const constructWebmaster = async () => {
	log("Checking for Webmaster...");

	// Role
	let webmasterRole = await UserRoleModel.findOne({ name: "Webmaster" });

	if (!webmasterRole) {
		webmasterRole = new UserRoleModel({
			name: "Webmaster",
			description:
				"System-generated user role, reserved to the webmaster user.",
			locked: true,
		});

		await webmasterRole.save();

		success("Created Webmaster user role.");
	} else if (!webmasterRole.locked) {
		webmasterRole.locked = true;
		await webmasterRole.save();

		warn(
			"Webmaster role was left unlocked, (editable) but has been relocked. While this is generally not a concern, the Webmaster role can only be unlocked through direct database manipulation. If you did not make this change, please verify your system is secure or contact your deployment's webmaster."
		);
	}

	// User
	let user = await UserModel.findOne({
		roles: { $in: [webmasterRole._id] },
	});

	if (!user) {
		user = new UserModel({
			name: "Webmaster",
			username: "webmaster",
			verified: false,
			roles: [webmasterRole._id],
		});

		warn("No webmaster user exists. One has been created.");
	} else success("Webmaster exists.");

	// If the user is unverified, we reset their password.
	if (!user.verified) {
		const password = generateRandomPassword(12);
		user.password = await bcrypt.hash(password, +process.env.SALT || 12);
		user.jwtTimestamp = new Date().toISOString();

		await user.save();

		error(
			`Webmaster credentials:\n\nUsername: ${user.username}\nPassword: ${password}\n\nLogin as webmaster and change the password immediately.`
		);

		// Ensure a system message exists to indicate the user is unverified.
		let message = await SystemMessageModel.findOne({
			alias: "unverified-webmaster",
		});

		if (!message) {
			message = new SystemMessageModel({
				alias: "unverified-webmaster",
				type: "warning",
				content:
					"An unverified webmaster user exists in the database. Check the server logs for credentials and login as the webmaster to change the password immediately.",
				confidential: false,
			});

			await message.save();
		}
	} else
		await SystemMessageModel.findOneAndDelete({
			alias: "unverified-webmaster",
		});
};
