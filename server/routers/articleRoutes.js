import { Router } from "express";
import {
	createArticle,
	queryArticles,
	findArticleById,
	findArticleByIdAndDelete,
	findArticleByIdAndUpdate,
} from "../controllers/article.js";

const articleRouter = Router();

articleRouter.route("/").get(queryArticles).post(createArticle);
articleRouter
	.route("/:id")
	.get(findArticleById)
	.put(findArticleByIdAndUpdate)
	.delete(findArticleByIdAndDelete);

export default articleRouter;
