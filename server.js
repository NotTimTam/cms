import "dotenv/config";
import express from "express";
import next from "next";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { error, log, success } from "@nottimtam/console.js";

import nodePackage from "./package.json" assert { type: "json" };

import { connectMongoDB } from "./server/util/mongoose.js";
import {
	constructGlobalConfiguration,
	constructWebmaster,
} from "./server/config/constructors.js";

import API from "./util/API.js";

import globalConfigurationRouter from "./server/routers/globalConfigurationRoutes.js";
import systemRouter from "./server/routers/systemRoutes.js";
import articleRouter from "./server/routers/content/articleRoutes.js";
import categoryRouter from "./server/routers/content/categoryRoutes.js";
import tagRouter from "./server/routers/content/tagRoutes.js";
import userRouter from "./server/routers/users/userRoutes.js";

import {
	authenticationMiddleware,
	verificationMiddleware,
} from "./server/middleware/userMiddleware.js";
import GridFSInterface from "./server/util/GridFSInterface.js";
import { SERVER__getServerConfig } from "./server/util/env.js";

// Create GridFS interface.
export const gridFSInterface = new GridFSInterface();

// Configure process.exit.
process.on("exit", (code) =>
	code === 0
		? success(`Server stopped successfully with code: ${code}`)
		: error(`Server stopped with code: ${code}`)
);

const spinup = async () => {
	// Connect to database.
	await connectMongoDB();

	// Construct initial documents if necessary.
	await constructWebmaster();
	await constructGlobalConfiguration();

	// Return server configuration.
	const {
		PORT,
		NODE_ENV,
		RATELIMITER: {
			USE: USE_RATELIMIT,
			INTERVAL: RATELIMIT_INTERVAL,
			REQUESTS: RATELIMIT_REQUESTS,
			INFO_IN_HEADERS: RATELIMIT_INFO_IN_HEADERS,
		},
		CORS: USE_CORS,
		CACHE: { USE: USE_CACHE, COLLECTION: CACHE_COLLECTION },
	} = await SERVER__getServerConfig();

	// Import package data.
	const { version, name } = nodePackage;

	// Initialize express app.
	const app = express();

	// Load middleware and Next.js.
	const nextJS = next({ dev: NODE_ENV === "development" });
	const nextJSRequestHandler = nextJS.getRequestHandler();

	const standardHeaders = RATELIMIT_INFO_IN_HEADERS === "true";

	// Configure and use middleware.
	app.disable("x-powered-by");
	app.use(express.json());

	if (USE_CORS) app.use(cors());
	if (USE_RATELIMIT)
		app.use(
			rateLimit({
				windowMs: RATELIMIT_INTERVAL,
				limit: RATELIMIT_REQUESTS,
				standardHeaders: standardHeaders,
				legacyHeaders: !standardHeaders,
			})
		);

	// Load and configure API.
	app.use(
		API.globalConfiguration,
		authenticationMiddleware,
		verificationMiddleware,
		globalConfigurationRouter
	);
	app.use(API.system, systemRouter);
	app.use(
		API.articles,
		authenticationMiddleware,
		verificationMiddleware,
		articleRouter
	);
	app.use(
		API.tags,
		authenticationMiddleware,
		verificationMiddleware,
		tagRouter
	);
	app.use(
		API.categories,
		authenticationMiddleware,
		verificationMiddleware,
		categoryRouter
	);
	app.use(API.users, userRouter);

	// gridFSInterface.uploadFile(
	// 	"testfile3.js",
	// 	"test file data 3",
	// 	"test",
	// 	{
	// 		test: "field",
	// 		another: "field 2",
	// 		test: 7,
	// 		another: "ye",
	// 	},
	// 	"utf-8"
	// );

	nextJS.prepare().then(async () => {
		log(`Staring ${name} version ${version}`);

		// Configure request handler and begin handling requests.

		app.all("*", (req, res) => nextJSRequestHandler(req, res));

		app.listen(PORT, (err) => {
			if (err) {
				error(err);
			} else log(`Listening on port ${PORT}`);
		});
	});
};

spinup();
