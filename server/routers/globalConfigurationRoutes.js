import { Router } from "express";
import {
	getGlobalConfiguration,
	updateGlobalConfiguration,
} from "../controllers/globalConfiguration.js";

const globalConfigurationRouter = Router();

globalConfigurationRouter
	.route("/")
	.get(getGlobalConfiguration)
	.patch(updateGlobalConfiguration);

export default globalConfigurationRouter;
