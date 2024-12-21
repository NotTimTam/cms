import UserModel from "../models/users/UserModel.js";
import { handleUnexpectedError } from "../util/controller.js";
import jwt from "jsonwebtoken";
import { getUserPermissions } from "../util/permissions.js";

/**
 * Authenticate a user before moving forward.
 * @param {Object} req.headers The user login object.
 * @param {String} req.headers.authorization The user's authentication token. Format: `"Bearer <token>"`.
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

/**
 * Ensure a user is verified before moving forward.
 * @param {Object} req.users `authenticationMiddleware` must be used before `verificationMiddleware`.
 */
export const verificationMiddleware = async (req, res, next) => {
	try {
		if (!req.user)
			return res.status(401).send("User is not authenticated.");

		// Unverified users are routed to a page where they can verify themselves.
		if (!req.user.verified)
			return res.status(401).send("User is not verified.");

		next();
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Simulate user verification status temporarily, for the purpose of allowing them to validate themselves.
 */
export const psuedoVerifiedMiddleware = async (req, res, next) => {
	try {
		if (!req.user)
			return res.status(401).send("User is not authenticated.");

		if (!req.user.verified) {
			const { id } = req.params;

			if (id === req.user._id.toString()) req.user.verified = true;
		}

		next();
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * **NOTE:** This method *builds* a middleware function.
 *
 * Require the user to have a certain permission to access a database route.
 * @param {string} component The component the permission is a part of. Such as `"system"`.
 * @param {string} permission The component permission the user must have in order to access this route. Such as `"edit"`.
 * @returns {function} A middleware method.
 */
export const permissionsMiddleware =
	(component, permission) => async (req, res, next) => {
		try {
			if (!req.user)
				return res.status(401).send("User is not authenticated.");

			let permitted = false;

			// Automatically let users with "all" permissions through.
			const allPermission = user.permissionGroups.find(
				({ name }) => name === "all"
			);
			if (
				allPermission &&
				allPermission.permissions[0] &&
				allPermission.permissions[0].status === true
			)
				permitted = true;
			else {
				const permissions = await getUserPermissions(req.user);

				if (
					permissions[component] &&
					permissions[component].hasOwnProperty(permission) &&
					permissions[component][permission] === true
				)
					permitted = true;
			}

			if (permitted) next();
			else
				return res
					.status(401)
					.send("User does not have necessary access permissions.");
		} catch (error) {
			return handleUnexpectedError(res, error);
		}
	};
