/**
 * Convert a document's name into a valid alias.
 * @param {String} name The name to convert.
 * @returns {string} A valid alias string.
 */
export const nameToAlias = (name) => {
	if (!name) throw new Error("No name provided.");
	if (typeof name !== "string") throw new TypeError("Expected a string.");

	return name
		.trim()
		.replace(/ /g, "-")
		.replace(/[^a-zA-Z0-9_-]/g, "")
		.toLowerCase()
		.substring(0, 1024);
};
