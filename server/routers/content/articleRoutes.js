import { Router } from "express";
import {
	createArticle,
	findArticles,
	findArticleById,
	findArticleByIdAndDelete,
	findArticleByIdAndUpdate,
	batchArticles,
	orderArticles,
	deleteArticles,
} from "../../controllers/content/article.js";

const articleRouter = Router();

articleRouter
	.route("/")
	.get(findArticles)
	.post(createArticle)
	.delete(deleteArticles);
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
