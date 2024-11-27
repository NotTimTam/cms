import { error, log, success, warn } from "@nottimtam/console.js";
import bcrypt from "bcryptjs";
import RoleModel from "../models/users/Role.js";
import UserModel from "../models/users/User.js";
import { generateRandomPassword } from "../../util/data.js";

/**
 * Ensure that a webmaster exists, and create one if it does not.
 */
export const constructWebmaster = async () => {
	log("Checking for Webmaster...");

	// Role
	let webmasterRole = await RoleModel.findOne({ name: "Webmaster" });

	if (!webmasterRole) {
		webmasterRole = new RoleModel({
			name: "Webmaster",
			description:
				"System-generated role, reserved to the webmaster user.",
			locked: true,
		});

		await webmasterRole.save();

		success("Created Webmaster role.");
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
			locked: true,
		});

		warn("No webmaster user exists. One has been created.");
	} else success("Webmaster exists.");

	// If the user is not locked, we relock them.
	if (!user.locked) {
		user.locked = true;

		await user.save();
	}

	// If the user is unverified, we reset their password.
	if (!user.verified) {
		const password = generateRandomPassword(12);
		user.password = await bcrypt.hash(password, +process.env.SALT || 12);
		user.jwtTimestamp = new Date().toISOString();

		await user.save();

		error(
			`Webmaster credentials:\n\nUsername: ${user.username}\nPassword: ${password}\n\nLogin as webmaster and change the password immediately.`
		);
	}
};
