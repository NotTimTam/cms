import { Router } from "express";
import {
	createArticle,
	findArticles,
	findArticleById,
	findArticleByIdAndDelete,
	findArticleByIdAndUpdate,
	batchArticles,
	orderArticles,
} from "../controllers/content/article.js";

const articleRouter = Router();

articleRouter.route("/").get(findArticles).post(createArticle);
articleRouter.patch(
	"/batch",

	batchArticles
);
articleRouter.patch(
	"/order",

	orderArticles
);
articleRouter
	.route("/:id")
	.get(findArticleById)
	.patch(findArticleByIdAndUpdate)
	.delete(findArticleByIdAndDelete);

export default articleRouter;
