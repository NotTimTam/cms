import UserModel from "../../models/users/User.js";
import { handleUnexpectedError } from "../../util/controller.js";
import { emailRegex, nameRegex } from "../../../util/regex.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Login as a user.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user login object.
 * @param {string} req.body.username The user's username. (if no email address is provided)
 * @param {string} req.body.email The user's email address. (if no username is provided)
 * @param {string} req.body.password The user's password.
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
			{ userId: user._id },
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
 * @param {string} req.user The user provided by authentication middleware.
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
		let { name, username, password, email } = req.body;

		if (!name) return res.status(400).send("No name provided.");

		if (typeof name !== "string" || !nameRegex.test(name))
			return res
				.status(400)
				.send(
					`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
				);

		if (!username) return res.status(400).send("No username provided.");

		if (typeof username !== "string" || !nameRegex.test(username))
			return res
				.status(400)
				.send(
					`Invalid username provided. Expected a string between 1 and 1024 characters in length.`
				);

		if (await UserModel.findOne({ username }))
			return res
				.status(422)
				.send(`A user already exists with that username.`);

		if (!password || typeof password !== "string")
			return res.status(400).send("No/invalid password provided.");

		if (email) {
			if (typeof email !== "string" || !emailRegex.test(email))
				return res
					.status(400)
					.send(
						`Invalid email provided. Expected a valid email address.`
					);

			if (await UserModel.findOne({ email }))
				return res
					.status(422)
					.send(`A user already exists with that email.`);
		}

		const user = new UserModel({
			name,
			username,
			password: await bcrypt.hash(password, 12),
			email,
			verified: false,
			groups: [],
		});

		await user.save();

		return res.status(200).json({ user });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query users.
 * @param {Express.Request} req
 */
export const findUsers = async (req, res) => {
	try {
		const users = await UserModel.find({});

		return res.status(200).json({ users });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a user by their ID.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the user to find.
 */
export const findUserById = async (req, res) => {
	try {
		const { id } = req.params;

		const user = await UserModel.findById(id);

		if (!user) return res.status(404).send(`No user found with id "${id}"`);

		return res.status(200).json({ user });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a user by their ID and delete them.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the user to find.
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
 * Find a user by their ID and update their data.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the user to find.
 */
export const findUserByIdAndUpdate = async (req, res) => {
	try {
		const { id } = req.params;

		const user = await UserModel.findById(id);

		if (!user) return res.status(404).send(`No user found with id "${id}"`);

		throw new Error("No update logic implemented.");

		return res.status(200).json({ user });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
