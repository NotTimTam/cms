import UserModel from "../models/users/User.js";
import { handleUnexpectedError } from "../util/controller.js";
import jwt from "jsonwebtoken";

/**
 * Authenticate a user before moving forward.
 * @param {Object} req.headers The user login object.
 * @param {string} req.headers.authorization The user's authentication token. Format: `"Bearer <token>"`.
 */
export const authenticationMiddleware = async (req, res, next) => {
	try {
		const { authorization } = req.headers;

		if (!authorization)
			return res
				.status(401)
				.send('No "authorization" property in header.');

		if (!authorization.includes("Bearer "))
			return res.status(498).send("Authorization malformed.");

		const [Bearer, token] = authorization.split(" ");

		if (!token)
			return res.status(498).send("Authorization token malformed.");

		const decoded = jwt.decode(token, process.env.JWT_SECRET);

		if (!decoded)
			throw new Error("Failed to decode JWT token. Could be malformed.");

		if (!decoded.userId)
			throw new Error(
				'No "userId" parameter attached to JWT token. This could mean that JWT signed a malformed token.'
			);

		if (!decoded.jwtTimestamp)
			throw new Error(
				`No "jwtTimestamp" parameter attached to JWT token. This could mean that JWT signed a malformed token.`
			);

		const user = await UserModel.findById(decoded.userId);

		if (!user)
			return res.status(498).send("Authorization token malformed.");

		if (user.jwtTimestamp.toISOString() !== decoded.jwtTimestamp)
			return res.status(498).send("Authentication token expired.");

		req.user = user;

		next();
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
