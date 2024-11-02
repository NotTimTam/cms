/**
 * Create a valid API route url from a series of strings.
 * @param  {...string} branches The branch strings to use. Should not start or end with a slash.
 * @returns {string} A valid API route url.
 */
export const createRouteURL = (...branches) =>
	`/${branches
		.map((branch) => {
			branch = branch.trim();
			if (branch[0] === "/" || branch[0] === "\\") branch.shift();
			if (
				branch[branch.length - 1] === "/" ||
				branch[branch.length - 1] === "\\"
			)
				branch.pop();

			return branch;
		})
		.join("/")}`;
