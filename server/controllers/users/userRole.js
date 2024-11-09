import { handleUnexpectedError } from "../../util/controller";

/**
 * Create a new UserRole document.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createUserRole = async (req, res) => {
	try {
		// let { name, username, password, email } = req.body;
		// if (!name) return res.status(400).send('No "name" property provided.');
		// if (typeof name !== "string" || !nameRegex.test(name))
		// 	return res
		// 		.status(400)
		// 		.send(
		// 			`Invalid "name" property provided. Expected a string between 1 and 1024 characters in length.`
		// 		);
		// if (!username)
		// 	return res.status(400).send('No "username" property provided.');
		// if (typeof username !== "string" || !nameRegex.test(username))
		// 	return res
		// 		.status(400)
		// 		.send(
		// 			`Invalid "username" property provided. Expected a string between 1 and 1024 characters in length.`
		// 		);
		// if (await UserModel.findOne({ username }))
		// 	return res
		// 		.status(422)
		// 		.send(`A user already exists with that username.`);
		// if (!password || typeof password !== "string")
		// 	return res
		// 		.status(400)
		// 		.send('Expected a "password" string property.');
		// if (email) {
		// 	if (typeof email !== "string" || !emailRegex.test(email))
		// 		return res
		// 			.status(400)
		// 			.send(
		// 				`Invalid "email" property provided. Expected a valid email address.`
		// 			);
		// 	if (await UserModel.findOne({ email }))
		// 		return res
		// 			.status(422)
		// 			.send(`A user already exists with that email.`);
		// }
		// const user = new UserModel({
		// 	name,
		// 	username,
		// 	password: await bcrypt.hash(password, 12),
		// 	email,
		// 	verified: false,
		// 	groups: [],
		// });
		// await user.save();
		// return res.status(200).send({ user });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
