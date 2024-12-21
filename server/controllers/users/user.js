import UserModel from "../../models/users/UserModel.js";
import RoleModel from "../../models/users/RoleModel.js";
import { handleUnexpectedError } from "../../util/controller.js";
import { emailRegex, nameRegex } from "../../../util/regex.js";
import {
	createSystemProtectionQuery,
	getPathToDocument,
	protectedQuery,
	visibleQuery,
} from "../..//util/database.js";
import {
	ResError,
	stripQuery,
	validateUser,
	validateUserQuery,
} from "../../util/validators.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { stripMongoDBFieldsFromBody } from "../../util/data.js";
import { getUserPermissions } from "../../util/permissions.js";

/**
 * Login as a user.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user login object.
 * @param {String} req.body.username The user's username. (if no email address is provided)
 * @param {String} req.body.email The user's email address. (if no username is provided)
 * @param {String} req.body.password The user's password.
 */
export const loginUser = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		if (!username && !email)
			return res
				.status(400)
				.send("You must provide a username or email address.");

		if (
			username &&
			(typeof username !== "string" || !nameRegex.test(username))
		)
			return res.status(400).send("Invalid username provided.");

		if (email && (typeof email !== "string" || !emailRegex.test(email)))
			return res.status(400).send("Invalid email address provided.");

		let user;
		if (username)
			user = await UserModel.findOne({ username }).select("+password");
		else if (email)
			user = await UserModel.findOne({ email }).select("+password");

		if (!user || !(await bcrypt.compare(password, user.password)))
			return res
				.status(404)
				.send(`Incorrect username or password provided.`);

		await jwt.sign(
			{ userId: user._id, jwtTimestamp: user.jwtTimestamp },
			process.env.JWT_SECRET,
			{
				expiresIn: "1w",
			},
			(error, token) => {
				if (error) throw error;

				return res.status(200).json({ token });
			}
		);
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Authenticate user.
 * @param {Express.Request} req The API request object.
 * @param {String} req.user The user provided by authentication middleware.
 */
export const authenticateUser = async (req, res) => {
	try {
		const { user } = req;

		return res.status(200).json({ user });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Create a new user.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createUser = async (req, res) => {
	try {
		req.body.jwtTimestamp = new Date().toISOString();

		try {
			req.body = await validateUser(stripMongoDBFieldsFromBody(req.body));
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		req.body.password = await bcrypt.hash(
			req.body.password,
			+process.env.SALT || 12
		);

		const user = new UserModel(req.body);

		await user.save();

		return res
			.status(200)
			.json({ user: await UserModel.findById(user._id) });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query users.
 * @param {Express.Request} req The API request object.
 */
export const findUsers = async (req, res) => {
	try {
		try {
			req.query = await validateUserQuery(req.query);
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const {
			search,
			sortField = "createdAt",
			sortDir = "-1",
			role,
		} = req.query;
		let {
			page = "0",
			itemsPerPage = "20",
			protected: protect,
			visible,
		} = req.query;

		if (protect === "true") protect = true;
		else if (protect === "false") protect = false;
		else protect = null;

		if (visible === "true") visible = true;
		else if (visible === "false") visible = false;
		else visible = null;

		const query = {
			...createSystemProtectionQuery({ protected: protect, visible }),
		};

		if (search)
			query["$or"] = [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];

		const numUsers = await UserModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numUsers : +itemsPerPage;

		const numPages = Math.ceil(numUsers / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		let users = await UserModel.find(query)
			.sort({ [sortField]: +sortDir })
			.select("+status")
			.limit(+itemsPerPage)
			.skip(page * +itemsPerPage)
			.lean();

		if (role) {
			const role = await RoleModel.findById(role);

			if (!role)
				return res.status(404).send(`No role found with id "${role}"`);

			const roleTree = await getPathToDocument(
				role._id,
				RoleModel,
				"role"
			);

			users = users.filter(({ roles }) =>
				roles.some((role) => roleTree.includes(role.toString()))
			);
		}

		return res.status(200).json({
			users,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a user by their ID.
 * @param {Express.Request} req The API request object.
 * @param {String} req.params.id The ID of the user to find.
 */
export const findUserById = async (req, res) => {
	try {
		const { id } = req.params;

		const user = await UserModel.findById(id);

		if (!user) return res.status(404).send(`No user found with id "${id}"`);

		const permissionInheritance = await getUserPermissions(user, true);

		return res.status(200).json({ user, permissionInheritance });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a user by their ID and delete them.
 * @param {Express.Request} req The API request object.
 * @param {String} req.params.id The ID of the user to find.
 */
export const findUserByIdAndDelete = async (req, res) => {
	try {
		const { id } = req.params;

		await UserModel.findByIdAndDelete(id);

		return res.status(200).send("User deleted successfully.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Delete a selection of users.
 */
export const deleteUsers = async (req, res) => {
	try {
		try {
			req.query = await validateUserQuery(req.query);
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		let { selection } = req.query;

		if (!selection)
			return res
				.status(400)
				.send('No "selection" parameter provided in query.');

		const users = await UserModel.find(stripQuery(req.query)).lean();

		if (selection === "all")
			selection = users.map(({ _id }) => _id.toString());
		else selection = selection.split(",");

		await UserModel.deleteMany({
			_id: { $in: selection },
		});

		return res.status(200).send("Users deleted successfully.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a user by their ID and update their data.
 * @param {Express.Request} req The API request object.
 * @param {String} req.params.id The ID of the user to find.
 */
export const findUserByIdAndUpdate = async (req, res) => {
	try {
		const { id } = req.params;

		if (req.body._id && id.toString() !== req.body._id.toString())
			return res
				.status(400)
				.send(
					'Request body "_id" parameter does not match request "_id" parameter.'
				);

		const user = await UserModel.findById(id);

		if (!user) return res.status(404).send(`No user found with id "${id}"`);

		if (user.protected && req.user._id.toString() !== user._id.toString())
			return res
				.status(401)
				.send("You are not authorized to edit protected users.");

		let verifiedSelf = false;
		if (req.body.password) {
			// Hash the new password.
			req.body.password = await bcrypt.hash(
				req.body.password,
				+process.env.SALT || 12
			);

			// If the user is unverified and updating their own password, we can mark them as verified.
			if (
				!user.verified &&
				req.user._id.toString() === user._id.toString()
			) {
				req.body.verified = true;
				verifiedSelf = true;
			}

			// Update JWT timestamp. This will require the user to relogin by invalidating existing JWT tokens.
			req.body.jwtTimestamp = new Date().toISOString();
		}

		try {
			req.body = await validateUser({
				...(await UserModel.findById(id).select("+password").lean()),
				...stripMongoDBFieldsFromBody(req.body),
			});
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		// Store new values.
		for (const [key, value] of Object.entries(req.body)) {
			user[key] = value;
		}

		await user.save();

		// If the user just verified themselves, we redirect them to log back in.
		if (verifiedSelf) return res.redirect("/administrator/login");
		// Otherwise we return the updated user data.
		else
			return res.status(200).json({ user: await UserModel.findById(id) });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
