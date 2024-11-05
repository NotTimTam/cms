/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str The string to capitalize the words in.
 * @returns {string} The string, adjusted with each word capitalized.
 */
export const capitalizeWords = (str) =>
	str &&
	str
		.split(" ")
		.map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
		.join(" ");
