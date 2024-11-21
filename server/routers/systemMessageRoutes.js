import { Router } from "express";
import { findSystemMessages } from "../controllers/content/systemMessage.js";

import {
	authenticationMiddleware,
	verificationMiddleware,
} from "../middleware/userMiddleware.js";

const systemMessageRouter = Router();

systemMessageRouter.get("/", findSystemMessages);
systemMessageRouter.get(
	"/confidential",
	authenticationMiddleware,
	verificationMiddleware,
	findSystemMessages
);

export default systemMessageRouter;
