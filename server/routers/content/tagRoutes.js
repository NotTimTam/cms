import { Router } from "express";

import {
	createTag,
	findTags,
	getTagTree,
	getPossibleParents,
	deleteTags,
	orderTags,
	findTagById,
	findTagByIdAndUpdate,
} from "../../controllers/content/tag.js";
import { permissionsMiddleware } from "../../middleware/userMiddleware.js";

const tagRouter = Router();

tagRouter
	.route("/")
	.get(permissionsMiddleware("tag", "view"), findTags)
	.post(permissionsMiddleware("tag", "create"), createTag)
	.delete(permissionsMiddleware("tag", "delete"), deleteTags);

tagRouter.get("/tree", permissionsMiddleware("tag", "view"), getTagTree);
tagRouter.get(
	"/parents/:id",
	permissionsMiddleware("tag", "view"),
	getPossibleParents
);

tagRouter.get("/order", permissionsMiddleware("tag", "reorder"), orderTags);

tagRouter
	.route("/:id")
	.get(permissionsMiddleware("tag", "view"), findTagById)
	.patch(permissionsMiddleware("tag", "edit"), findTagByIdAndUpdate);

export default tagRouter;
