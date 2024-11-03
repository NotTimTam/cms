import { Router } from "express";
import {
	createUser,
	findUserById,
	findUserByIdAndDelete,
	findUserByIdAndUpdate,
	findUsers,
	loginUser,
	authenticateUser,
} from "../controllers/user.js";
import { authenticationMiddleware } from "../middleware/userMiddleware.js";

const userRouter = Router();

userRouter.route("/").get(findUsers).post(createUser);
userRouter
	.route("/auth")
	.post(loginUser)
	.get(authenticationMiddleware, authenticateUser);
userRouter
	.route("/:id")
	.get(findUserById)
	.patch(findUserByIdAndUpdate)
	.delete(findUserByIdAndDelete);

export default userRouter;
