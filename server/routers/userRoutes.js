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
	deleteUserRoles,
	orderUserRoles,
	findUserRoles,
	findUserRoleById,
	findUserRoleByIdAndUpdate,
	getPossibleParents,
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
	.post(authenticationMiddleware, createUserRole)
	.delete(authenticationMiddleware, deleteUserRoles);
userRouter.patch("/roles/order", authenticationMiddleware, orderUserRoles);
userRouter.get(
	"/roles/parents/:id",
	authenticationMiddleware,
	getPossibleParents
);
userRouter
	.route("/roles/:id")
	.get(authenticationMiddleware, findUserRoleById)
	.patch(authenticationMiddleware, findUserRoleByIdAndUpdate);

// User-Specific Routes
userRouter
	.route("/:id")
	.get(authenticationMiddleware, findUserById)
	.patch(authenticationMiddleware, findUserByIdAndUpdate)
	.delete(authenticationMiddleware, findUserByIdAndDelete);

export default userRouter;
