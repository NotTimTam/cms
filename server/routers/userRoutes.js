import { Router } from "express";
import {
	createUser,
	findUserById,
	findUserByIdAndDelete,
	findUserByIdAndUpdate,
	findUsers,
	loginUser,
	authenticateUser,
} from "../controllers/users/user.js";
import {
	createUserRole,
	findUserRoleById,
	findUserRoleByIdAndDelete,
	findUserRoleByIdAndUpdate,
	findUserRoles,
	batchUserRoles,
} from "../controllers/users/userRole.js";
import { authenticationMiddleware } from "../middleware/userMiddleware.js";

const userRouter = Router();

// General User Routes
userRouter.route("/").get(findUsers).post(createUser);
userRouter
	.route("/auth")
	.post(loginUser)
	.get(authenticationMiddleware, authenticateUser);

// Roles
userRouter
	.route("/roles")
	.get(authenticationMiddleware, findUserRoles)
	.post(authenticationMiddleware, createUserRole);
userRouter.patch("/roles/batch", authenticationMiddleware, batchUserRoles);
userRouter
	.route("/roles/:id")
	.get(authenticationMiddleware, findUserRoleById)
	.patch(authenticationMiddleware, findUserRoleByIdAndUpdate)
	.delete(authenticationMiddleware, findUserRoleByIdAndDelete);

// User-Specific Routes
userRouter
	.route("/:id")
	.get(authenticationMiddleware, findUserById)
	.patch(authenticationMiddleware, findUserByIdAndUpdate)
	.delete(authenticationMiddleware, findUserByIdAndDelete);

export default userRouter;
