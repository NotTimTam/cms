import { Router } from "express";
import { shutdown, getSystemMessages } from "../controllers/system.js";
import {
	authenticationMiddleware,
	verificationMiddleware,
} from "../middleware/userMiddleware.js";

const systemRouter = Router();

systemRouter.get(
	"/shutdown",
	authenticationMiddleware,
	verificationMiddleware,
	shutdown
);

systemRouter.get("/messages", getSystemMessages);
systemRouter.get(
	"/messages/confidential",
	authenticationMiddleware,
	verificationMiddleware,
	getSystemMessages
);

export default systemRouter;
