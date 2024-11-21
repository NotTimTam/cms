import { Router } from "express";
import { getSystemMessages } from "../controllers/content/systemMessage.js";

import {
	authenticationMiddleware,
	verificationMiddleware,
} from "../middleware/userMiddleware.js";

const systemMessageRouter = Router();

systemMessageRouter.get("/", getSystemMessages);
systemMessageRouter.get(
	"/confidential",
	authenticationMiddleware,
	verificationMiddleware,
	getSystemMessages
);

export default systemMessageRouter;
