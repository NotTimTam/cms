import "dotenv/config";
import express from "express";
import next from "next";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { error, log } from "@nottimtam/console.js";
import nodePackage from "./package.json" assert { type: "json" };
import connectMongoDB from "./server/util/connectMongoDB.js";
import articleRouter from "./server/routers/articleRoutes.js";
import userRouter from "./server/routers/userRoutes.js";
import API from "./util/API.js";

// Import configuration.
const { version, name } = nodePackage;
const {
	PORT = 3000,
	NODE_ENV = "development",
	RATELIMIT_INTERVAL = "60000",
	RATELIMIT_REQUESTS = "10000",
	RATELIMIT_INFO_IN_HEADERS = "true",
	JWT_SECRET,
} = process.env;

// Validate environment variables.
if (!JWT_SECRET)
	throw new Error('No "JWT_SECRET" environment variable defined.');

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

app.use(API.createRouteURL(apiRoute, "articles"), articleRouter);
app.use(API.createRouteURL(apiRoute, "users"), userRouter);

nextJS.prepare().then(async () => {
	log(`Staring ${name} version ${version}`);

	await connectMongoDB();

	app.all("*", (req, res) => nextJSRequestHandler(req, res));

	app.listen(PORT, (err) => {
		if (err) {
			error(err);
		} else log(`Listening on port ${PORT}`);
	});
});
