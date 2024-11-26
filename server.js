import "dotenv/config";
import express from "express";
import next from "next";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { error, log, warn } from "@nottimtam/console.js";

import nodePackage from "./package.json" assert { type: "json" };

import connectMongoDB from "./server/util/connectMongoDB.js";
import { constructWebmaster } from "./server/config/constructors.js";

import API from "./util/API.js";

import articleRouter from "./server/routers/articleRoutes.js";
import categoryRouter from "./server/routers/categoryRoutes.js";
import systemMessageRouter from "./server/routers/systemMessageRoutes.js";
import userRouter from "./server/routers/userRoutes.js";
import tagRouter from "./server/routers/tagRoutes.js";

import {
	authenticationMiddleware,
	verificationMiddleware,
} from "./server/middleware/userMiddleware.js";

// Import configuration.
const { version, name } = nodePackage;
const {
	PORT = 3000,
	NODE_ENV = "development",
	RATELIMIT_INTERVAL = "60000",
	RATELIMIT_REQUESTS = "10000",
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

// Initialize express app.
const app = express();

// Configure process.exit.
process.on("exit", (code) =>
	code === 0
		? success(`Server stopped successfully with code: ${code}`)
		: error(`Server stopped with code: ${code}`)
);

// Load middleware and Next.js.
const nextJS = next({ dev: NODE_ENV === "development" });
const nextJSRequestHandler = nextJS.getRequestHandler();

const standardHeaders = RATELIMIT_INFO_IN_HEADERS === "true";

const rateLimiter = rateLimit({
	windowMs: +RATELIMIT_INTERVAL,
	max: +RATELIMIT_REQUESTS,
	standardHeaders: standardHeaders,
	legacyHeaders: !standardHeaders,
});

// Configure and use middleware.
app.disable("x-powered-by");
app.use(express.json(), cors(), rateLimiter);

// Load and configure API.
const apiRoute = `/api`;

app.use(
	API.articles,
	authenticationMiddleware,
	verificationMiddleware,
	articleRouter
);
app.use(API.tags, authenticationMiddleware, verificationMiddleware, tagRouter);
app.use(
	API.categories,
	authenticationMiddleware,
	verificationMiddleware,
	categoryRouter
);
app.use(API.messages, systemMessageRouter);
app.use(API.users, userRouter);

nextJS.prepare().then(async () => {
	log(`Staring ${name} version ${version}`);

	await connectMongoDB();
	await constructWebmaster();

	app.all("*", (req, res) => nextJSRequestHandler(req, res));

	app.listen(PORT, (err) => {
		if (err) {
			error(err);
		} else log(`Listening on port ${PORT}`);
	});
});
