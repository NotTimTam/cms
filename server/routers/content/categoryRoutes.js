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
import { permissionsMiddleware } from "../../middleware/userMiddleware.js";

const categoryRouter = Router();

categoryRouter
	.route("/")
	.get(permissionsMiddleware("category", "view"), findCategories)
	.post(permissionsMiddleware("category", "create"), createCategory)
	.delete(permissionsMiddleware("category", "delete"), deleteCategories);

categoryRouter.get(
	"/tree",
	permissionsMiddleware("category", "view"),
	getCategoryTree
);
categoryRouter.get(
	"/parents/:id",
	permissionsMiddleware("category", "view"),
	getPossibleParents
);

categoryRouter.get(
	"/order",
	permissionsMiddleware("category", "reorder"),
	orderCategories
);

categoryRouter
	.route("/:id")
	.get(permissionsMiddleware("category", "view"), findCategoryById)
	.patch(
		permissionsMiddleware("category", "edit"),
		findCategoryByIdAndUpdate
	);

export default categoryRouter;
