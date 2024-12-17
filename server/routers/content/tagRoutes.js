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

const tagRouter = Router();

tagRouter.route("/").get(findTags).post(createTag).delete(deleteTags);

tagRouter.get("/tree", getTagTree);
tagRouter.get("/parents/:id", getPossibleParents);

tagRouter.get("/order", orderTags);

tagRouter.route("/:id").get(findTagById).patch(findTagByIdAndUpdate);

export default tagRouter;
