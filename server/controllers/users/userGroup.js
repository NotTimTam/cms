import { orderDocuments } from "../../util/database.js";
import UserGroupModel from "../../models/users/UserGroup.js";
import { handleUnexpectedError } from "../../util/controller.js";
import {
	validateGenericQuery,
	validateUserGroup,
	ValidatorError,
} from "../../util/validators.js";

/**
 * Create a new UserGroup document.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createUserGroup = async (req, res) => {
	try {
		const groupWithHighestOrder = await UserGroupModel.findOne({}).sort({
			order: -1,
		});

		req.body.order = groupWithHighestOrder
			? groupWithHighestOrder.order + 1
			: 0;

		try {
			req.body = await validateUserGroup(req.body);
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const userGroup = new UserGroupModel(req.body);

		await userGroup.save();

		return res.status(200).json({ userGroup });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query user groups.
 */
export const findUserGroups = async (req, res) => {
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

		if (search) query.name = { $regex: search, $options: "i" };

		const numGroups = await UserGroupModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numGroups : +itemsPerPage;

		const numPages = Math.ceil(numGroups / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		const userGroups = await UserGroupModel.find(query)
			.sort({ [sortField]: +sortDir })
			.limit(+itemsPerPage)
			.skip(page * +itemsPerPage)
			.lean();

		return res.status(200).json({
			userGroups,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Delete a selection of user groups.
 */
export const deleteUserGroups = async (req, res) => {
	try {
		let { selection } = req.query;

		if (!selection)
			return res
				.status(400)
				.send('No "selection" parameter provided in query.');

		const userGroups = await UserGroupModel.find({}).lean();

		if (selection === "all")
			selection = userGroups
				.map(({ _id }) => _id.toString())
				.filter(({ locked }) => !locked);
		else selection = selection.split(",");

		await UserGroupModel.deleteMany({
			$or: [{ locked: { $exists: false } }, { locked: false }], // Locked groups cannot be deleted.
			_id: { $in: selection },
		});

		return res.status(200).send("User groups deleted successfully.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific user group by its ID.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the user group to find.
 */
export const findUserGroupById = async (req, res) => {
	try {
		const { id } = req.params;

		const userGroup = await UserGroupModel.findById(id);

		if (!userGroup)
			return res.status(404).send(`No user group found with id "${id}"`);

		return res.status(200).json({ userGroup });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific user group by its ID and position it before another one in the order system.
 * @param {Express.Request} req The API request object.
 * @param {string} req.query.active The ID of the user group to move.
 * @param {string} req.query.over The ID of the user group to move before.
 * @param {1|-1} req.query.dir The direction to move in.
 */
export const orderUserGroups = async (req, res) => {
	try {
		const { active, over } = req.query;
		const dir = +req.query.dir || 1;

		await orderDocuments(active, over, dir, UserGroupModel, "user group");

		return res.status(200).send("User group order change successful.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific user group by its ID and update it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the user group to find.
 * @param {Object} req.body The user group update object.
 */
export const findUserGroupByIdAndUpdate = async (req, res) => {
	try {
		const { id } = req.params;

		if (req.body._id && id.toString() !== req.body._id.toString())
			return res
				.status(400)
				.send(
					'Request body "_id" parameter does not match request "_id" parameter.'
				);

		const userGroup = await UserGroupModel.findById(id);

		if (!userGroup)
			return res.status(404).send(`No user group found with id "${id}"`);

		if (userGroup.locked)
			return res
				.status(401)
				.send("You are not authorized to edit locked user groups.");

		try {
			req.body = await validateUserGroup({
				...(await UserGroupModel.findById(id).lean()),
				...req.body,
			});
		} catch (error) {
			if (error instanceof ValidatorError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		// Store new values.
		for (const [key, value] of Object.entries(req.body)) {
			userGroup[key] = value;
		}

		await userGroup.save();

		return res.status(200).json({ userGroup });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
