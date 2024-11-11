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
} from "../controllers/users/userRole.js";
import {
	createUserGroup,
	deleteUserGroups,
	orderUserGroups,
	findUserGroups,
	findUserGroupById,
	findUserGroupByIdAndUpdate,
} from "../controllers/users/userGroup.js";
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
userRouter
	.route("/roles/:id")
	.get(authenticationMiddleware, findUserRoleById)
	.patch(authenticationMiddleware, findUserRoleByIdAndUpdate);

// Roles
userRouter
	.route("/groups")
	.get(authenticationMiddleware, findUserGroups)
	.post(authenticationMiddleware, createUserGroup)
	.delete(authenticationMiddleware, deleteUserGroups);
userRouter.patch("/groups/order", authenticationMiddleware, orderUserGroups);
userRouter
	.route("/groups/:id")
	.get(authenticationMiddleware, findUserGroupById)
	.patch(authenticationMiddleware, findUserGroupByIdAndUpdate);

// User-Specific Routes
userRouter
	.route("/:id")
	.get(authenticationMiddleware, findUserById)
	.patch(authenticationMiddleware, findUserByIdAndUpdate)
	.delete(authenticationMiddleware, findUserByIdAndDelete);

export default userRouter;
