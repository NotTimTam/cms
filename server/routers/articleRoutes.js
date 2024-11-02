import { Router } from "express";
import {
	createArticle,
	findArticles,
	findArticleById,
	findArticleByIdAndDelete,
	findArticleByIdAndUpdate,
	findArticleByAlias,
} from "../controllers/article.js";

const articleRouter = Router();

articleRouter.route("/").get(findArticles).post(createArticle);
articleRouter.get("/alias/:alias", findArticleByAlias);
articleRouter
	.route("/:id")
	.get(findArticleById)
	.put(findArticleByIdAndUpdate)
	.delete(findArticleByIdAndDelete);

export default articleRouter;