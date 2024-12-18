/**
 * Check whether a value is `true` or `false`, strictly.
 * @param {*} v The value to check.
 * @returns {boolean} Whether or not the value is a boolean.
 */
export const isBoolean = (v) => v === true || v === false;

/**
 * Generate a random password of a given length.
 * @param {Number} length The length of the password.
 * @returns {string} A randomly generated password.
 */
export const generateRandomPassword = (length) =>
	[...Array(length)]
		.map(() => Math.random().toString(36).slice(2, 8))
		.join("")
		.slice(0, length);

/**
 * Options for the number of items to show per page on a list.
 */
export const listLimitOptions = [
	5,
	10,
	15,
	20,
	25,
	30,
	50,
	100,
	200,
	500,
	"all",
];

/**
 * The default global configuration object.
 */
export const defaultGlobalConfiguration = {
	site: {
		name: "Untitled Website",
		metadata: {
			robots: "noindex, nofollow",
			showCMSVersion: true,
			showAuthorMetaTag: true,
		},
	},
	server: {
		cache: {
			use: true,
			path: "/cache",
		},
		temp: "/tmp",
		webServices: {
			cors: true,
			rateLimiter: { use: true, interval: 60000, requests: 5 },
		},
	},
	permissions: [],
};
