import { Router } from "express";
import {
	createUser,
	findUserById,
	findUserByIdAndDelete,
	findUserByIdAndUpdate,
	findUsers,
	loginUser,
	authenticateUser,
	deleteUsers,
} from "../controllers/users/user.js";
import {
	createUserRole,
	deleteUserRoles,
	orderUserRoles,
	findUserRoles,
	findUserRoleById,
	findUserRoleByIdAndUpdate,
	getPossibleParents,
	getUserRoleTree,
} from "../controllers/users/userRole.js";
import {
	authenticationMiddleware,
	verificationMiddleware,
} from "../middleware/userMiddleware.js";

const userRouter = Router();

// General User Routes
userRouter
	.route("/")
	.get(authenticationMiddleware, verificationMiddleware, findUsers)
	.post(authenticationMiddleware, verificationMiddleware, createUser)
	.delete(authenticationMiddleware, verificationMiddleware, deleteUsers);
userRouter
	.route("/auth")
	.post(loginUser)
	.get(authenticationMiddleware, authenticateUser);

// Roles
userRouter
	.route("/roles")
	.get(authenticationMiddleware, verificationMiddleware, findUserRoles)
	.post(authenticationMiddleware, verificationMiddleware, createUserRole)
	.delete(authenticationMiddleware, verificationMiddleware, deleteUserRoles);
userRouter.patch(
	"/roles/order",
	authenticationMiddleware,
	verificationMiddleware,
	orderUserRoles
);
userRouter.get(
	"/roles/tree",
	authenticationMiddleware,
	verificationMiddleware,
	getUserRoleTree
);
userRouter.get(
	"/roles/parents/:id",
	authenticationMiddleware,
	getPossibleParents
);
userRouter
	.route("/roles/:id")
	.get(authenticationMiddleware, verificationMiddleware, findUserRoleById)
	.patch(
		authenticationMiddleware,
		verificationMiddleware,
		findUserRoleByIdAndUpdate
	);

// User-Specific Routes
userRouter
	.route("/:id")
	.get(authenticationMiddleware, findUserById)
	.patch(authenticationMiddleware, findUserByIdAndUpdate)
	.delete(
		authenticationMiddleware,
		verificationMiddleware,
		findUserByIdAndDelete
	);

export default userRouter;
