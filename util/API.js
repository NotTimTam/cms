/**
 * An interface that simplifies the process of using JavaScript's `Fetch` api.
 */
export default class API {
	static route = "api";
	static users = `${API.route}/users`;
	static articles = `${API.route}/articles`;

	/**
	 * Authenticate the user.
	 * @param {string} token The token to authenticate with.
	 * @returns {Object} The user object, or `undefined` if the user is not authorized.
	 */
	static authenticate = async (token) => {
		if (!token || typeof token !== "string")
			throw new TypeError("Expected a string for authentication token.");

		const { data } = await API.get(API.createRouteURL(API.users, "auth"), {
			headers: {
				authorization: `Bearer ${token}`,
			},
		});

		return data;
	};

	/**
	 * Create a valid API route url from a series of strings.
	 * @param  {...string} branches The branch strings to use. Should not start or end with a slash.
	 * @returns {string} A valid API route url.
	 */
	static createRouteURL = (...branches) =>
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

	static __getData = async (response) => {
		// Read the body of the response based on its content type
		let responseData;

		const contentType = response.headers.get("content-type");
		if (contentType.includes("application/json")) {
			responseData = await response.json(); // Read and parse JSON
		} else if (contentType.includes("text/")) {
			responseData = await response.text(); // Read as text
		} else {
			throw new Error("Unsupported content type: " + contentType);
		}

		// Create a proxy to provide access to the response data
		return new Proxy(response, {
			get(target, prop) {
				if (prop === "data") {
					return responseData; // Return the pre-read data
				}
				return target[prop]; // Fallback for other properties
			},
		});
	};

	static __req = async (url, data) => {
		if (data.body instanceof Object) {
			data.body = JSON.stringify(data.body);

			if (!data.headers) data.headers = {};

			data.headers["Content-Type"] = "application/json";
		}

		const res = await API.__getData(await fetch(url, data));

		if (!res.ok) throw res;

		return res;
	};

	static get = async (url, __additionalConfig) =>
		API.__req(url, { method: "GET", ...__additionalConfig });

	static post = async (url, body, __additionalConfig) =>
		API.__req(url, {
			method: "POST",
			body,
			...__additionalConfig,
		});

	static put = async (url, body, __additionalConfig) =>
		API.__req(url, {
			method: "PUT",
			body,
			...__additionalConfig,
		});

	static patch = async (url, body, __additionalConfig) =>
		API.__req(url, {
			method: "PATCH",
			body,
			...__additionalConfig,
		});

	static delete = async (url, __additionalConfig) =>
		API.__req(url, { method: "DELETE", ...__additionalConfig });
}