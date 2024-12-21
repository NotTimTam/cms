import { Router } from "express";
import {
	getGlobalConfiguration,
	updateGlobalConfiguration,
} from "../controllers/globalConfiguration.js";
import { permissionsMiddleware } from "../middleware/userMiddleware.js";

const globalConfigurationRouter = Router();

globalConfigurationRouter
	.route("/")
	.get(
		permissionsMiddleware("globalConfiguration", "view"),
		getGlobalConfiguration
	)
	.patch(
		permissionsMiddleware("globalConfiguration", "edit"),
		updateGlobalConfiguration
	);

export default globalConfigurationRouter;
