import { SERVER__getGlobalConfiguration } from "./mongoose.js";

/**
 * **SYSTEM UTIL**
 */
export const SERVER__getServerConfig = async () => {
	// Get environment configuration.
	const {
		PORT = 3000,
		NODE_ENV = "development",
		RATELIMIT_INTERVAL = "1000",
		RATELIMIT_REQUESTS = "50",
		RATELIMIT_INFO_IN_HEADERS = "true",
		JWT_SECRET,
		SALT,
	} = process.env;

	// Validate environment variables.
	if (!JWT_SECRET)
		throw new Error('No "JWT_SECRET" environment variable defined.');

	if (SALT) {
		if (isNaN(+SALT))
			throw new Error(`Environment variable "SALT" is not a number.`);

		if (+SALT < 12 || +SALT > 24)
			warn(
				`An environment "SALT" variable at or between 12 and 24 is recommended for optimal password security/validation speed.`
			);
	}

	// Configure server based on environment variables.
	const serverConfig = {
		PORT,
		NODE_ENV,
		JWT_SECRET,
		SALT,
		RATELIMITER: {
			USE: true,
			INTERVAL: +RATELIMIT_INTERVAL,
			REQUESTS: +RATELIMIT_REQUESTS,
			INFO_IN_HEADERS: RATELIMIT_INFO_IN_HEADERS === "true",
		},
		CORS: true,
		CACHE: {
			USE: true,
			COLLECTION: "cache",
		},
	};

	// Overwrite environment variables with global configuration.
	const globalConfiguration = await SERVER__getGlobalConfiguration();

	if (globalConfiguration && globalConfiguration.server) {
		const {
			server: { cache, webServices },
		} = globalConfiguration;

		if (cache) {
			if (cache.hasOwnProperty("use"))
				serverConfig.CACHE.USE = Boolean(cache.use);

			if (cache.hasOwnProperty("collection"))
				serverConfig.CACHE.COLLECTION = cache.collection;
		}

		if (webServices) {
			const { rateLimiter } = webServices;

			if (webServices.hasOwnProperty("cors")) {
				serverConfig.CORS = Boolean(webServices.cors);
			}

			if (rateLimiter) {
				// use interval requests
				if (rateLimiter.hasOwnProperty("use"))
					serverConfig.RATELIMITER.USE = Boolean(rateLimiter.use);

				if (rateLimiter.hasOwnProperty("interval"))
					serverConfig.RATELIMITER.INTERVAL = rateLimiter.interval;
				if (rateLimiter.hasOwnProperty("requests"))
					serverConfig.RATELIMITER.REQUESTS = rateLimiter.requests;
			}
		}
	}

	return serverConfig;
};
