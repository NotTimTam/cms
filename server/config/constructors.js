import { error, success, warn } from "@nottimtam/console.js";
import bcrypt from "bcryptjs";
import {
	defaultGlobalConfiguration,
	generateRandomPassword,
} from "../../util/data.js";
import RoleModel from "../models/users/RoleModel.js";
import UserModel from "../models/users/UserModel.js";
import GlobalConfigurationModel from "../models/GlobalConfigurationModel.js";

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
 * Ensure that a global configuration exists, and create one if it does not.
 */
export const constructGlobalConfiguration = async () => {
	let globalConfiguration = await GlobalConfigurationModel.findOne({});

	if (!globalConfiguration) {
		globalConfiguration = new GlobalConfigurationModel(
			defaultGlobalConfiguration
		);

		await globalConfiguration.save();

		success("Created global configuration.");
	}

	return globalConfiguration;
};
