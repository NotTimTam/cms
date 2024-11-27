/**
 * An interface that simplifies the process of using JavaScript's `Fetch` api.
 */
export default class API {
	/**
	 * Create a valid API route url from a series of strings.
	 * @param  {...string} branches The branch strings to use.
	 * @returns {string} A valid API route url.
	 */
	static createRouteURL = (...branches) =>
		branches
			.filter((branch) => branch)
			.map((branch) => branch.trim())
			.join("/");

	static route = "/api";
	static users = API.createRouteURL(API.route, "users");
	static articles = API.createRouteURL(API.route, "articles");
	static categories = API.createRouteURL(API.route, "categories");
	static roles = API.createRouteURL(API.users, "roles");
	static messages = API.createRouteURL(API.route, "messages");
	static tags = API.createRouteURL(API.route, "tags");

	/**
	 * Create a query from a JS Object.
	 * @param {Object} query The object to create a query from.
	 *
	 * Arrays of objects are unsupported, all other arrays will be converted to csvs.
	 * Nested objects within this object will have their keys flattened. Example:
	 * ```js
	 * const input = {
	 * 	topLevel: { bottomLevel: "fourteen" }
	 * }
	 * // becomes:
	 * const output = {
	 * 	topLevelBottomLevel: "fourteen"
	 * }
	 * ```
	 */
	static createQueryString = (query) => {
		const mergeKeys = (key, subKey) =>
			`${key}${subKey[0].toUpperCase()}${subKey.slice(
				-1 * (subKey.length - 1)
			)}`;
		const flattenObject = (object, resolve = {}, keyOrigin) => {
			for (let [key, value] of Object.entries(object)) {
				if (keyOrigin) key = mergeKeys(keyOrigin, key);

				if (value instanceof Array) {
					const anyObjects = value.find(
						(subValue) => typeof subValue === "object"
					);

					if (anyObjects && anyObjects.length > 0)
						throw new TypeError(
							"API.createQueryString does not support objects/arrays nested within arrays."
						);

					resolve[key] = value.join(",");
				} else if (typeof value === "object") {
					for (const [subKey, subValue] of Object.entries(value)) {
						const newKey = mergeKeys(key, subKey);

						if (typeof subValue === "object") {
							resolve = flattenObject(subValue, resolve, key);
						} else resolve[newKey] = subValue;
					}
				} else resolve[key] = value;
			}

			return resolve;
		};

		query = flattenObject(query);

		const searchParams = new URLSearchParams();

		for (const [key, value] of Object.entries(query)) {
			searchParams.append(key, value);
		}

		return searchParams;
	};

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
	 * Creates a header object with an authorization token.
	 * @param {string} token The authorization token.
	 * @returns {Object} Authorization headers.
	 */
	static createAuthorizationConfig = (token) => ({
		headers: {
			authorization: `Bearer ${token}`,
		},
	});

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

		if (res.redirected && window) window.location = res.url;

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
