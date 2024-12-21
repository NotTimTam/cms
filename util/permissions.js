/**
 * Class for defining permissions.
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
 * Class for defining what permissions a component needs.
 */
export class ComponentPermissions {
	/**
	 * Create a new `ComponentPermissions` instance.
	 * @param {String} name The name of the component.
	 * @param {String} label The display label of the component.
	 * @param {string[]} definitions An array of the string indentifiers for `PermissionDefinition` instances in the `definitions` object.
	 */
	constructor(name, label, definitions) {
		this.name = name;
		this.label = label;
		this.definitions = definitions;
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
	view: new PermissionDefinition("View", "View this content."),
	all: new PermissionDefinition("All", "Unrestricted control. (dangerous)"),
};

export const defaultDefinitions = [
	"create",
	"delete",
	"edit",
	"reorder",
	"view",
];
export const systemDefinitions = ["permissions", "siteLogin", "adminLogin"];

/**
 * Component groups.
 */
export const componentPermissions = [
	new ComponentPermissions("globalConfiguration", "Global Configuration", [
		"edit",
		"view",
	]),
	new ComponentPermissions("role", "Roles", [...defaultDefinitions]),
	new ComponentPermissions("user", "Users", [...defaultDefinitions]),
	new ComponentPermissions("article", "Articles", defaultDefinitions),
	new ComponentPermissions("tag", "Tags", defaultDefinitions),
	new ComponentPermissions("category", "Categories", defaultDefinitions),
];

/**
 * System groups.
 */
export const systemPermissions = [
	new ComponentPermissions("system", "System", [...systemDefinitions]),
];

const allPermissions = [
	new ComponentPermissions("all", ":Root::All_Permissions", ["all"]),
	...componentPermissions,
	...systemPermissions,
];

export default allPermissions;
