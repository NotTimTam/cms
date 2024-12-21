import RoleModel from "../models/users/RoleModel.js";
import { buildDocumentTree, getPathToDocument } from "./database.js";
import { SERVER__getGlobalConfiguration } from "./mongoose.js";

/**
 * Convert an array of DB permission groups to a permission object.
 * @param {Array<Object>} permissionGroups The array to convert.
 * @returns {Object} The permission groups object.
 */
export const permissionGroupArrayToObject = (permissionGroups) =>
	Object.fromEntries(
		permissionGroups.map(({ name, permissions }) => [
			name,
			Object.fromEntries(
				permissions.map(({ name, status }) => [name, status])
			),
		])
	);

/**
 * Merge a descendant permission configuration into an inherited one.
 * @param {Object} inheritedPermissions The existing permissions object.
 * @param {Object} newPermissions The permissions object to merge.
 */
const mergePermissions = (inheritedPermissions = {}, newPermissions) => {
	componentLoop: for (const [component, permissions] of Object.entries(
		newPermissions
	)) {
		if (!inheritedPermissions[component]) {
			inheritedPermissions[component] = permissions;
			continue componentLoop;
		}

		permissionLoop: for (const [permission, state] of Object.entries(
			permissions
		)) {
			switch (inheritedPermissions[component][permission]) {
				case null:
					inheritedPermissions[component][permission] = state;
					continue permissionLoop;
				case true:
					// False states always override inheritance, everything else must be true.
					if (state === false)
						inheritedPermissions[component][permission] = false;
					else inheritedPermissions[component][permission] = true;
					continue permissionLoop;
				// False is always inherited.
				case false:
				default:
					continue permissionLoop;
			}
		}
	}

	return inheritedPermissions;
};

/**
 * Get a role's permissions configuration from the Global Configuration. Does not include the Role's internal permissions configuration.
 * @param {string} roleId The ID of the role to get the permissions for.
 * @param {Boolean} inheritanceOnly When true, it will only get the configuration for what this role inherits. When false, it will get this role's permissions.
 * @returns {Object} Permission configuration object.
 */
export const GlobalConfiguration_getRolePermissions = async (
	roleId,
	inheritanceOnly = false
) => {
	const pathToRole = await getPathToDocument(roleId, RoleModel, "role");

	// Remove this role from the path if only the inherited permissions are wanted.
	if (inheritanceOnly) pathToRole.pop();

	let inheritance = {};

	for (const roleId of pathToRole) {
		// key = system, value = object of permissions

		const getRolePermissionsObject = async (roleId) => {
			const { permissions } = await SERVER__getGlobalConfiguration();

			if (!permissions) return {};

			return Object.fromEntries(
				Object.entries(permissions).map(
					([component, rolePermissionGroups]) => {
						const rolePermissionGroup = rolePermissionGroups.find(
							({ role }) => role.toString() === roleId.toString()
						);

						const rolePermissions =
							rolePermissionGroup &&
							rolePermissionGroup.permissions
								? Object.fromEntries(
										rolePermissionGroup.permissions.map(
											({ name, status }) => [name, status]
										)
								  )
								: {};

						return [component, rolePermissions];
					}
				)
			);
		};

		const permissionGroups = await getRolePermissionsObject(roleId);

		componentLoop: for (const [component, permissions] of Object.entries(
			permissionGroups
		)) {
			if (!inheritance[component]) {
				inheritance[component] = permissions;
				continue componentLoop;
			}

			permissionLoop: for (const [permission, state] of Object.entries(
				permissions
			)) {
				switch (inheritance[component][permission]) {
					case null:
						inheritance[component][permission] = state;
						continue permissionLoop;
					case true:
						// False states always override inheritance, everything else must be true.
						if (state === false)
							inheritance[component][permission] = false;
						else inheritance[component][permission] = true;
						continue permissionLoop;
					// False is always inherited.
					case false:
					default:
						continue permissionLoop;
				}
			}
		}
	}

	return inheritance;
};

/**
 * Get a role's permissions configuration, including inherited permissions.
 * @param {RoleModel} roleId The id of the Role document to get the permissions for.
 * @param {Boolean} inheritanceOnly When true, it will only get the configuration for what this role inherits. When false, it will get this role's permissions **and** the permissions it inherits.
 * @returns {Object} Permission configuration object.
 */
export const getRolePermissions = async (roleId, inheritanceOnly = false) => {
	// First get the global configuration inheritance.
	const inheritance = await GlobalConfiguration_getRolePermissions(
		roleId,
		inheritanceOnly
	);

	const pathToRole = await getPathToDocument(roleId, RoleModel, "role");
	if (inheritanceOnly) pathToRole.pop(); // Remove this role from the path if only the inherited permissions are wanted.

	// Then get the actual permission configurations of all parents.
	for (const roleId of pathToRole) {
		const parentRole = await RoleModel.findById(roleId).lean();

		if (!parentRole) throw new Error("No role found with that id");

		const { permissionGroups } = parentRole;

		if (!permissionGroups) continue;

		for (const { name, permissions } of permissionGroups) {
			if (!inheritance[name]) inheritance[name] = {};

			if (permissions)
				for (const { name: permissionName, status } of permissions) {
					if (!inheritance[name].hasOwnProperty(permissionName))
						inheritance[name][permissionName] = status;
					else {
						const currentValue = inheritance[name][permissionName];

						let newValue = currentValue;

						switch (currentValue) {
							case null:
								newValue = status;
								break;
							case true:
								switch (status) {
									case null:
									case true:
										newValue = true;
										break;
									case false:
										newValue = false;
										break;
								}
								break;
							case false:
								newValue = false;
								break;
						}

						inheritance[name][permissionName] = newValue;
					}
				}
		}
	}

	// Note this inheritance is everything UP TO the role's permissions, but not including it.
	return inheritance;
};

/**
 * Get a user's permissions configuration, including inherited permissions.
 * @param {UserModel} user The User document to get the permissions for.
 * @param {Boolean} inheritanceOnly When true, it will only get the configuration for what this user inherits. When false, it will get this user's permissions **and** the permissions it inherits.
 * @returns {Object} Permission configuration object.
 */
export const getUserPermissions = async (user, inheritanceOnly = false) => {
	let { roles } = user;
	const { permissionGroups } = user;

	let permissions = {};

	// Get permissions for each role the user has.
	if (roles && roles.length > 0) {
		roles = (
			await buildDocumentTree(
				await RoleModel.find({ _id: { $in: roles } }).lean(),
				RoleModel,
				{ _id: { $in: roles } },
				{ order: 1 }
			)
		).sort(({ order: a }, { order: b }) => a - b);
	}

	// Combine them.
	for (const role of roles)
		permissions = mergePermissions(
			permissions,
			await getRolePermissions(role._id, false)
		);

	// Apply user-specific permissions if allowed.
	if (!inheritanceOnly)
		permissions = mergePermissions(
			permissions,
			await permissionGroupArrayToObject(permissionGroups)
		);

	return permissions;
};
