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
	 * @param {string} name The name of the component.
	 * @param {string} label The display label of the component.
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
	all: new PermissionDefinition("All", "Unrestricted control. (dangerous)"),
};

const defaultDefinitions = ["create", "delete", "edit", "reorder"];
const userDefinitions = ["permissions", "all", "siteLogin", "adminLogin"];

/**
 * Component groups.
 */
const componentPermissions = [
	new ComponentPermissions("all", ":Root::All_Permissions", ["all"]),
	new ComponentPermissions("role", "Role", [
		...defaultDefinitions,
		...userDefinitions,
	]),
	new ComponentPermissions("user", "User", [
		...defaultDefinitions,
		...userDefinitions,
	]),
	new ComponentPermissions("article", "Article", defaultDefinitions),
	new ComponentPermissions("tag", "Tag", defaultDefinitions),
	new ComponentPermissions("category", "Category", defaultDefinitions),
];

export const getComponentPermissions = (component) =>
	componentPermissions.find(({ name }) => name === component);

export default componentPermissions;
