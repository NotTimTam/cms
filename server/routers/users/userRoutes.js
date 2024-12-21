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
} from "../../controllers/users/user.js";
import {
	createRole,
	deleteRoles,
	orderRoles,
	findRoles,
	findRoleById,
	findRoleByIdAndUpdate,
	getPossibleParents,
	getRoleTree,
} from "../../controllers/users/role.js";
import {
	authenticationMiddleware,
	permissionsMiddleware,
	editSelfBypassMiddleware,
	verificationMiddleware,
} from "../../middleware/userMiddleware.js";

const userRouter = Router();

// General User Routes
userRouter
	.route("/")
	.get(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("user", "view"),
		findUsers
	)
	.post(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("user", "create"),
		createUser
	)
	.delete(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("user", "delete"),
		deleteUsers
	);
userRouter
	.route("/auth")
	.post(loginUser)
	.get(
		authenticationMiddleware,
		permissionsMiddleware("system", "adminLogin"),
		authenticateUser
	);

// Roles
userRouter
	.route("/roles")
	.get(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("role", "view"),
		findRoles
	)
	.post(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("role", "create"),
		createRole
	)
	.delete(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("role", "delete"),
		deleteRoles
	);
userRouter.patch(
	"/roles/order",
	authenticationMiddleware,
	verificationMiddleware,
	permissionsMiddleware("role", "reorder"),
	orderRoles
);
userRouter.get(
	"/roles/tree",
	authenticationMiddleware,
	verificationMiddleware,
	permissionsMiddleware("role", "view"),
	getRoleTree
);
userRouter.get(
	"/roles/parents/:id",
	authenticationMiddleware,
	permissionsMiddleware("role", "view"),
	getPossibleParents
);
userRouter
	.route("/roles/:id")
	.get(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("role", "view"),
		findRoleById
	)
	.patch(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("role", "edit"),
		findRoleByIdAndUpdate
	);

// User-Specific Routes

userRouter
	.route("/:id")
	.get(
		authenticationMiddleware,
		editSelfBypassMiddleware,
		verificationMiddleware,
		permissionsMiddleware("user", "view"),
		findUserById
	)
	.patch(
		authenticationMiddleware,
		editSelfBypassMiddleware,
		verificationMiddleware,
		permissionsMiddleware("user", "edit"),
		findUserByIdAndUpdate
	)
	.delete(
		authenticationMiddleware,
		verificationMiddleware,
		permissionsMiddleware("user", "delete"),
		findUserByIdAndDelete
	);

export default userRouter;
