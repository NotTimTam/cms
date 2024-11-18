/**
 * Check whether a value is `true` or `false`, strictly.
 * @param {*} v The value to check.
 * @returns {boolean} Whether or not the value is a boolean.
 */
export const isBoolean = (v) => v === true || v === false;

/**
 * Generate a random password of a given length.
 * @param {number} length The length of the password.
 * @returns {string} A randomly generated password.
 */
export const generateRandomPassword = (length) =>
	[...Array(length)]
		.map(() => Math.random().toString(36).slice(2, 8))
		.join("")
		.slice(0, length);
