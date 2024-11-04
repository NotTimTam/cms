import { Router } from "express";
import {
	createArticle,
	findArticles,
	findArticleById,
	findArticleByIdAndDelete,
	findArticleByIdAndUpdate,
	findArticleByAlias,
} from "../controllers/article.js";

import { authenticationMiddleware } from "../middleware/userMiddleware.js";

const articleRouter = Router();

articleRouter
	.route("/")
	.get(findArticles)
	.post(authenticationMiddleware, createArticle);
articleRouter.get("/alias/:alias", findArticleByAlias);
articleRouter
	.route("/:id")
	.get(authenticationMiddleware, findArticleById)
	.patch(authenticationMiddleware, findArticleByIdAndUpdate)
	.delete(authenticationMiddleware, findArticleByIdAndDelete);

export default articleRouter;
