import UserModel from "../models/User.js";
import { handleUnexpectedError } from "../util/controller.js";
import { emailRegex, nameRegex } from "../util/regex.js";

/**
 * Create a new user.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createUser = async (req, res) => {
	try {
		let { name, username, password, email } = req.body;

		if (!name)
			return res.status(400).send('No "name" property provided for.');

		if (typeof name !== "string" || !nameRegex.test(name))
			return res
				.status(400)
				.send(
					`Invalid "name" property provided for. Expected a string between 1 and 1024 characters in length.`
				);

		if (!username)
			return res.status(400).send('No "username" property provided for.');

		if (typeof username !== "string" || !nameRegex.test(username))
			return res
				.status(400)
				.send(
					`Invalid "username" property provided for. Expected a string between 1 and 1024 characters in length.`
				);

		if (await UserModel.findOne({ username }))
			return res
				.status(422)
				.send(`A user already exists with that username.`);

		if (!password || typeof password !== "string")
			return res
				.status(400)
				.send('Expected a "password" string property.');

		if (email) {
			if (typeof email !== "string" || !emailRegex.test(email))
				return res
					.status(400)
					.send(
						`Invalid "email" property provided for. Expected a valid email address.`
					);

			if (await UserModel.findOne({ email }))
				return res
					.status(422)
					.send(`A user already exists with that email.`);
		}

		const user = new UserModel({
			name,
			username,
			password,
			email,
			verified: false,
			groups: [],
		});

		await user.save();

		return res.status(200).send({ user });
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
