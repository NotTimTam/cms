import {
	buildDocumentTree,
	createSystemProtectionQuery,
	flattenDocumentTree,
	getPathToDocument,
	orderDocuments,
} from "../../util/database.js";
import RoleModel from "../../models/users/RoleModel.js";
import { handleUnexpectedError } from "../../util/controller.js";
import {
	validateRole,
	ResError,
	validateNestQuery,
	validateGenericQuery,
	stripQuery,
} from "../../util/validators.js";
import mongoose from "mongoose";
import { stripMongoDBFieldsFromBody } from "../../util/data.js";
import { getRolePermissions } from "../../util/permissions.js";

/**
 * Create a new Role document.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createRole = async (req, res) => {
	try {
		const roleWithHighestOrder = await RoleModel.findOne({}).sort({
			order: -1,
		});

		req.body.order = roleWithHighestOrder
			? roleWithHighestOrder.order + 1
			: 0;

		try {
			req.body = await validateRole(stripMongoDBFieldsFromBody(req.body));
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const role = new RoleModel(req.body);

		await role.save();

		return res.status(200).json({ role });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query roles.
 */
export const findRoles = async (req, res) => {
	try {
		try {
			req.query = await validateNestQuery(req.query);
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const { search, sortField = "createdAt", sortDir = "-1" } = req.query;
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

		if (search) query.name = { $regex: search, $options: "i" };

		const numRoles = await RoleModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numRoles : +itemsPerPage;

		const numPages = Math.ceil(numRoles / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		const roles = await RoleModel.find(query)
			.sort({ [sortField]: +sortDir })
			.limit(+itemsPerPage)
			.skip(page * +itemsPerPage)
			.lean();

		for (const role of roles) {
			const path = await getPathToDocument(role._id, RoleModel, "role");
			path.pop(); // Remove the id from the end of the array.

			role.depth = path.length;
		}

		return res.status(200).json({
			roles,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query roles in a tree format.
 */
export const getRoleTree = async (req, res) => {
	try {
		try {
			req.query = await validateNestQuery(req.query);
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const {
			search,
			sortField = "createdAt",
			sortDir = "-1",
			depth,
		} = req.query;
		let {
			page = "0",
			itemsPerPage = "20",
			root,
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

		if (search) query.name = { $regex: search, $options: "i" };

		const numRoles = await RoleModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numRoles : +itemsPerPage;

		const numPages = Math.ceil(numRoles / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		let roles = [];
		if (!root) {
			query.parent = { $exists: false }; // Filter to just root items.
			roles = await RoleModel.find(query)
				.sort({ [sortField]: +sortDir })
				.lean();

			delete query.parent;
		} else {
			query._id = root;
			const rootRole = await RoleModel.findOne(query).lean();

			if (rootRole) roles = [rootRole];

			delete query._id;
		}

		if (roles && roles.length > 0) {
			// Build document tree.
			roles = await buildDocumentTree(
				roles,
				RoleModel,
				query,
				{ [sortField]: +sortDir },
				"",
				depth
			);

			// Flatten document tree.
			roles = flattenDocumentTree(roles).slice(
				page * itemsPerPage,
				page * itemsPerPage + itemsPerPage
			);
		}

		return res.status(200).json({
			roles,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query roles for possible parents.
 * @param {Express.Request} req The API request object.
 * @param {String} req.params.id The ID of the role to find a parent for.
 */
export const getPossibleParents = async (req, res) => {
	try {
		if (req.query) {
			try {
				req.query = await validateNestQuery(req.query);
			} catch (error) {
				if (error instanceof ResError)
					return res.status(error.code).send(error.message);
				else throw error;
			}
		}

		const { id } = req.params;

		if (id !== "all" && !mongoose.Types.ObjectId.isValid(id))
			return res.status(400).send("Invalid role id provided.");

		let { protected: protect, visible } = req.query;

		if (protect === "true") protect = true;
		else if (protect === "false") protect = false;
		else protect = null;

		if (visible === "true") visible = true;
		else if (visible === "false") visible = false;
		else visible = null;

		const query = {
			...createSystemProtectionQuery({ protected: protect, visible }),
		};

		if (req.query && req.query.search)
			query.name = { $regex: req.query.search, $options: "i" };

		if (id !== "all") {
			const role = await RoleModel.findById(id);

			if (!role)
				return res.status(400).send(`No role found with id "${id}"`);

			query._id = { $ne: id };
			query.$or = [
				{ parent: { $exists: false } },
				{ parent: { $ne: id } },
			];
		}

		// Get all roles that are NOT this role, and NOT a direct child of it.
		const roles = flattenDocumentTree(
			await buildDocumentTree(undefined, RoleModel, query, {
				order: 1,
			})
		);

		// Determine all "path-to-roots" for each role and ensure that the selected role is NOT found in any of them.
		let notReferenced = [];

		if (id === "all") {
			notReferenced = roles;
		} else {
			for (const role of roles) {
				const path = await getPathToDocument(
					role._id,
					RoleModel,
					"role"
				);
				path.pop(); // Remove the id from the end of the array.

				if (path.includes(id)) continue;

				notReferenced.push(role);
			}
		}

		return res.status(200).json({
			roles: notReferenced,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Delete a selection of roles.
 */
export const deleteRoles = async (req, res) => {
	try {
		try {
			req.query = await validateGenericQuery(req.query);
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

		const roles = await RoleModel.find(stripQuery(req.query)).lean();

		if (selection === "all")
			selection = roles
				.filter(({ visible }) => visible)
				.map(({ _id }) => _id.toString());
		else selection = selection.split(",");

		// Delete all descendants of role.
		const itemsAndDescendants = flattenDocumentTree(
			await buildDocumentTree(
				await RoleModel.find({
					_id: { $in: selection },
				}).lean(),
				RoleModel
			)
		).map(({ _id }) => _id.toString());

		await RoleModel.deleteMany({
			_id: { $in: itemsAndDescendants },
		});

		return res.status(200).send("roles deleted successfully.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific role by its ID and position it before another one in the order system.
 * @param {Express.Request} req The API request object.
 * @param {String} req.query.active The ID of the role to move.
 * @param {String} req.query.over The ID of the role to move before.
 * @param {1|-1} req.query.dir The direction to move in.
 */
export const orderRoles = async (req, res) => {
	try {
		const { active, over } = req.query;
		const dir = +req.query.dir || 1;

		await orderDocuments(active, over, dir, RoleModel, "role");

		return res.status(200).send("role order change successful.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific role by its ID.
 * @param {Express.Request} req The API request object.
 * @param {String} req.params.id The ID of the role to find.
 */
export const findRoleById = async (req, res) => {
	try {
		const { id } = req.params;

		const role = await RoleModel.findById(id);

		if (!role) return res.status(404).send(`No role found with id "${id}"`);

		const permissionInheritance = await getRolePermissions(role._id, false);

		return res.status(200).json({ role, permissionInheritance });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific role by its ID and update it.
 * @param {Express.Request} req The API request object.
 * @param {String} req.params.id The ID of the role to find.
 * @param {Object} req.body The role update object.
 */
export const findRoleByIdAndUpdate = async (req, res) => {
	try {
		const { id } = req.params;

		if (req.body._id && id.toString() !== req.body._id.toString())
			return res
				.status(400)
				.send(
					'Request body "_id" parameter does not match request "_id" parameter.'
				);

		const role = await RoleModel.findById(id);

		if (!role) return res.status(404).send(`No role found with id "${id}"`);

		if (role.protected)
			return res
				.status(401)
				.send("You are not authorized to edit protected roles.");

		try {
			req.body = await validateRole({
				...(await RoleModel.findById(id).lean()),
				...stripMongoDBFieldsFromBody(req.body),
			});
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		// Store new values.
		for (const [key, value] of Object.entries(req.body)) {
			role[key] = value;
		}

		await role.save();

		return res.status(200).json({ role });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
