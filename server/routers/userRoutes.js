import { Router } from "express";
import {
	createUser,
	findUserById,
	findUserByIdAndDelete,
	findUserByIdAndUpdate,
	findUsers,
} from "../controllers/user.js";

const userRouter = Router();

userRouter.route("/").get(findUsers).post(createUser);
userRouter
	.route("/:id")
	.get(findUserById)
	.put(findUserByIdAndUpdate)
	.delete(findUserByIdAndDelete);

export default userRouter;
