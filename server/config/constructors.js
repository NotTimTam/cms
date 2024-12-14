import { error, log, success, warn } from "@nottimtam/console.js";
import bcrypt from "bcryptjs";
import RoleModel from "../models/users/Role.js";
import UserModel from "../models/users/User.js";
import { generateRandomPassword } from "../../util/data.js";

/**
 * Ensure that a webmaster exists, and create one if it does not.
 */
export const constructWebmaster = async () => {
	// Role
	let webmasterRole = await RoleModel.findOne({ name: "Webmaster" });

	if (!webmasterRole) {
		webmasterRole = new RoleModel({
			name: "Webmaster",
			description:
				"System-generated role, reserved to the webmaster user.",
			protected: true,
			visible: false,
			permissionGroups: [
				{ name: "all", permissions: [{ name: "all", status: true }] },
			],
		});

		await webmasterRole.save();

		success("Created Webmaster role.");
	} else if (!webmasterRole.protected) {
		webmasterRole.protected = true;
		await webmasterRole.save();

		warn(
			"Webmaster role was left unprotected, (editable) but has been made protected. While this is generally not a concern, the Webmaster role can only be modified through direct database manipulation. If you did not make this change, please verify your system is secure or contact your deployment's webmaster."
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
			protected: true,
			visible: false,
			permissionGroups: [],
		});

		warn("No webmaster user exists. One has been created.");
	} else success("Webmaster validated");

	// If the user is unverified, we reset their password.
	if (!user.verified) {
		const password = generateRandomPassword(12);
		user.password = await bcrypt.hash(password, +process.env.SALT || 12);
		user.jwtTimestamp = new Date().toISOString();

		error(
			`Webmaster credentials:\n\nUsername: ${user.username}\nPassword: ${password}\n\nLogin as webmaster and change the password immediately.`
		);
	}

	// If the user is visible, we make them invisible.
	if (user.visible) {
		user.visible = false;
	}

	if (!user.protected) {
		user.protected = true;
	}

	try {
		await user.save();
	} catch (err) {
		error(
			"A fatal error occured when attempting to save webmaster user. Potential database corruption may have caused this. Error info:"
		);
		console.error(err);
		process.exit(1);
	}
};

/**
 * Ensure that the public user group exists, and create one if it does not.
 */
export const constructPublic = async () => {
	// Role
	let publicRole = await RoleModel.findOne({ name: "Public" });

	if (!publicRole) {
		publicRole = new RoleModel({
			name: "Public",
			description:
				"System-generated role, reserved to unauthenticated users.",
			protected: true,
			visible: true,
			permissionGroups: [],
			order: 1,
		});

		await publicRole.save();

		success("Created Public role.");
	} else if (!publicRole.protected) {
		publicRole.protected = true;
		await publicRole.save();

		warn(
			"Public role was left unprotected, (editable) but has been made protected. While this is generally not a concern, the Public role can only be modified through direct database manipulation. If you did not make this change, please verify your system is secure or contact your deployment's webmaster."
		);
	}
};
