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
import { permissionsMiddleware } from "../../middleware/userMiddleware.js";

const articleRouter = Router();

articleRouter
	.route("/")
	.get(permissionsMiddleware("article", "view"), findArticles)
	.post(permissionsMiddleware("article", "create"), createArticle)
	.delete(permissionsMiddleware("article", "delete"), deleteArticles);
articleRouter.patch(
	"/batch",
	permissionsMiddleware("article", "edit"),
	batchArticles
);
articleRouter.patch(
	"/order",
	permissionsMiddleware("article", "reorder"),
	orderArticles
);
articleRouter
	.route("/:id")
	.get(permissionsMiddleware("article", "view"), findArticleById)
	.patch(permissionsMiddleware("article", "edit"), findArticleByIdAndUpdate)
	.delete(
		permissionsMiddleware("article", "delete"),
		findArticleByIdAndDelete
	);

export default articleRouter;
