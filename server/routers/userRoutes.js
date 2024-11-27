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
	createRole,
	deleteRoles,
	orderRoles,
	findRoles,
	findRoleById,
	findRoleByIdAndUpdate,
	getPossibleParents,
	getRoleTree,
} from "../controllers/users/role.js";
import {
	authenticationMiddleware,
	psuedoVerifiedMiddleware,
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
	.get(authenticationMiddleware, verificationMiddleware, findRoles)
	.post(authenticationMiddleware, verificationMiddleware, createRole)
	.delete(authenticationMiddleware, verificationMiddleware, deleteRoles);
userRouter.patch(
	"/roles/order",
	authenticationMiddleware,
	verificationMiddleware,
	orderRoles
);
userRouter.get(
	"/roles/tree",
	authenticationMiddleware,
	verificationMiddleware,
	getRoleTree
);
userRouter.get(
	"/roles/parents/:id",
	authenticationMiddleware,
	getPossibleParents
);
userRouter
	.route("/roles/:id")
	.get(authenticationMiddleware, verificationMiddleware, findRoleById)
	.patch(
		authenticationMiddleware,
		verificationMiddleware,
		findRoleByIdAndUpdate
	);

// User-Specific Routes

userRouter
	.route("/:id")
	.get(
		authenticationMiddleware,
		psuedoVerifiedMiddleware,
		verificationMiddleware,
		findUserById
	)
	.patch(
		authenticationMiddleware,
		psuedoVerifiedMiddleware,
		verificationMiddleware,
		findUserByIdAndUpdate
	)
	.delete(
		authenticationMiddleware,
		verificationMiddleware,
		findUserByIdAndDelete
	);

export default userRouter;
