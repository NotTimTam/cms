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
 * Permissions configuration.
 */
export const definitions = {
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
const userDefinitions = ["permissions", "all"];
/**
 * Permission arrangement.
 */
export default {
	category: defaultDefinitions,
	tag: defaultDefinitions,
	article: defaultDefinitions,
	role: [...defaultDefinitions, ...userDefinitions],
	user: [...defaultDefinitions, ...userDefinitions],
};
