import { orderDocuments } from "../../util/database.js";
import UserRoleModel from "../../models/users/UserRole.js";
import { handleUnexpectedError } from "../../util/controller.js";
import {
	validateGenericQuery,
	validateUserRole,
	ValidatorError,
} from "../../util/validators.js";

/**
 * Create a new UserRole document.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createUserRole = async (req, res) => {
	try {
		const roleWithHighestOrder = await UserRoleModel.findOne({}).sort({
			order: -1,
		});

		req.body.order = roleWithHighestOrder
			? roleWithHighestOrder.order + 1
			: 0;

		try {
			req.body = await validateUserRole(req.body);
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const userRole = new UserRoleModel(req.body);

		await userRole.save();

		return res.status(200).json({ userRole });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

export const findUserRoles = async (req, res) => {
	try {
		try {
			req.query = await validateGenericQuery(req.query);
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const { search, sortField = "createdAt", sortDir = "-1" } = req.query;
		let { page = "0", itemsPerPage = "20" } = req.query;

		const query = {};

		if (search)
			query["$or"] = [
				{ name: { $regex: search, $options: "i" } },
				{ alias: { $regex: search, $options: "i" } },
			];

		const numRoles = await UserRoleModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numRoles : +itemsPerPage;

		const numPages = Math.ceil(numRoles / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		const userRoles = await UserRoleModel.find(query)
			.sort({ [sortField]: +sortDir })
			.limit(+itemsPerPage)
			.skip(page * +itemsPerPage)
			.lean();

		return res.status(200).json({
			userRoles,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific user role by its ID.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the user role to find.
 */
export const findUserRoleById = async (req, res) => {
	try {
		const { id } = req.params;

		const userRole = await UserRoleModel.findById(id);

		if (!userRole)
			return res.status(404).send(`No user role found with id "${id}"`);

		return res.status(200).json({ userRole });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific user role by its ID and position it before another one in the order system.
 * @param {Express.Request} req The API request object.
 * @param {string} req.query.active The ID of the user role to move.
 * @param {string} req.query.over The ID of the user role to move before.
 * @param {1|-1} req.query.dir The direction to move in.
 */
export const orderUserRoles = async (req, res) => {
	try {
		const { active, over } = req.query;
		const dir = +req.query.dir || 1;

		await orderDocuments(active, over, dir, UserRoleModel, "user role");

		return res.status(200).send("User role order change successful.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific user role by its ID and update it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the user role to find.
 * @param {Object} req.body The user role update object.
 */
export const findUserRoleByIdAndUpdate = async (req, res) => {
	try {
		const { id } = req.params;

		if (req.body._id && id.toString() !== req.body._id.toString())
			return res
				.status(400)
				.send(
					'Request body "_id" parameter does not match request "_id" parameter.'
				);

		const userRole = await UserRoleModel.findById(id);

		if (!userRole)
			return res.status(404).send(`No user role found with id "${id}"`);

		try {
			req.body = await validateUserRole({
				...(await UserRoleModel.findById(id).lean()),
				...req.body,
			});
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		// Store new values.
		for (const [key, value] of Object.entries(req.body)) {
			userRole[key] = value;
		}

		await userRole.save();

		return res.status(200).json({ userRole });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific user role by its ID and delete it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the user role to find.
 */
export const findUserRoleByIdAndDelete = async (req, res) => {
	try {
		const { id } = req.params;

		await UserRoleModel.findByIdAndDelete(id);

		return res.status(200).send("User role deleted successfully.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
