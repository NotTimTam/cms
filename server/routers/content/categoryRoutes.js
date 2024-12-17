import { Router } from "express";

import {
	createCategory,
	findCategories,
	getCategoryTree,
	getPossibleParents,
	deleteCategories,
	orderCategories,
	findCategoryById,
	findCategoryByIdAndUpdate,
} from "../../controllers/content/category.js";

const categoryRouter = Router();

categoryRouter
	.route("/")
	.get(findCategories)
	.post(createCategory)
	.delete(deleteCategories);

categoryRouter.get("/tree", getCategoryTree);
categoryRouter.get("/parents/:id", getPossibleParents);

categoryRouter.get("/order", orderCategories);

categoryRouter
	.route("/:id")
	.get(findCategoryById)
	.patch(findCategoryByIdAndUpdate);

export default categoryRouter;
