import { Router } from "express";
import { shutdown } from "../controllers/system.js";

const systemRouter = Router();

systemRouter.get("/shutdown", shutdown);

export default systemRouter;
