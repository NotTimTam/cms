import { Router } from "express";
import { getGlobalConfiguration } from "../controllers/globalConfiguration.js";

const globalConfigurationRouter = Router();

globalConfigurationRouter.route("/").get(getGlobalConfiguration);

export default globalConfigurationRouter;
