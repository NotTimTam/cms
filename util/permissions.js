/**
 * Methods for defining permissions.
 */
export class PermissionDefinition {
	/**
	 * Create a new `PermissionDefinition` instance.
	 * @property {string} name The display name of this permission.
	 * @property {string} description A description of the purpose of this permission.
	 */
	constructor(name, description) {
		this.name = name;
		this.description = description;
	}
}

/**
 * Permission action configuration.
 */
export const definitions = {
	siteLogin: new PermissionDefinition(
		"Site Login",
		"This user can login on the site front-end."
	),
	adminLogin: new PermissionDefinition(
		"Admin Login",
		"This user can login on the administrative portal."
	),
	permissions: new PermissionDefinition(
		"Change Permissions",
		"Reconfigure permissions across accessible content."
	),
	create: new PermissionDefinition("Create", "Create more of this content."),
	delete: new PermissionDefinition("Delete", "Delete this content."),
	edit: new PermissionDefinition("Edit", "Edit this content."),
	reorder: new PermissionDefinition("Reorder", "Reorder this content."),
	all: new PermissionDefinition("All", "Unrestricted control. (dangerous)"),
};

const defaultDefinitions = ["create", "delete", "edit", "reorder"];
const userDefinitions = ["permissions", "all", "siteLogin", "adminLogin"];

/**
 * Permission arrangement.
 */
export const category = defaultDefinitions;
export const tag = defaultDefinitions;
export const article = defaultDefinitions;
export const role = [...defaultDefinitions, ...userDefinitions];
export const user = [...defaultDefinitions, ...userDefinitions];
