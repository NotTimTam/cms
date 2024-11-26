import {
	buildDocumentTree,
	flattenDocumentTree,
	getPathToDocument,
	orderDocuments,
} from "../../util/database.js";
import CategoryModel from "../../models/content/Category.js";
import { handleUnexpectedError } from "../../util/controller.js";
import {
	validateCategory,
	ResError,
	validateNestQuery,
	validateGenericQuery,
	stripQuery,
} from "../../util/validators.js";
import mongoose from "mongoose";

/**
 * Create a new Category document.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createCategory = async (req, res) => {
	try {
		const roleWithHighestOrder = await CategoryModel.findOne({}).sort({
			order: -1,
		});

		req.body.order = roleWithHighestOrder
			? roleWithHighestOrder.order + 1
			: 0;

		try {
			req.body = await validateCategory(req.body);
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const category = new CategoryModel(req.body);

		await category.save();

		return res.status(200).json({ category });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query categories irrespective of their parent/child relationships.
 */
export const findCategories = async (req, res) => {
	try {
		try {
			req.query = await validateNestQuery(req.query);
		} catch (error) {
			if (error instanceof ResError)
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

		const numRoles = await CategoryModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numRoles : +itemsPerPage;

		const numPages = Math.ceil(numRoles / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		const categories = await CategoryModel.find(query)
			.sort({ [sortField]: +sortDir })
			.limit(+itemsPerPage)
			.skip(page * +itemsPerPage)
			.select("+status")
			.lean();

		for (const category of categories) {
			const path = await getPathToDocument(
				category._id,
				CategoryModel,
				"category"
			);
			path.pop(); // Remove the id from the end of the array.

			category.depth = path.length;
		}

		return res.status(200).json({
			categories,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query categories in a tree format.
 */
export const getCategoryTree = async (req, res) => {
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
		let { page = "0", itemsPerPage = "20", root } = req.query;

		const query = {};

		if (search)
			query["$or"] = [
				{ name: { $regex: search, $options: "i" } },
				{ alias: { $regex: search, $options: "i" } },
			];

		const numRoles = await CategoryModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numRoles : +itemsPerPage;

		const numPages = Math.ceil(numRoles / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		let categories = [];
		if (!root) {
			query.parent = { $exists: false }; // Filter to just root items.
			categories = await CategoryModel.find(query)
				.sort({ [sortField]: +sortDir })
				.select("+status")
				.lean();

			delete query.parent;
		} else {
			query._id = root;
			const rootCategory = await CategoryModel.findOne(query)
				.select("+status")
				.lean();

			if (rootCategory) categories = [rootCategory];

			delete query._id;
		}

		if (categories && categories.length > 0) {
			// Build document tree.
			categories = await buildDocumentTree(
				categories,
				CategoryModel,
				query,
				{ [sortField]: +sortDir },
				"+status",
				depth
			);

			// Flatten document tree.
			categories = flattenDocumentTree(categories).slice(
				page * itemsPerPage,
				page * itemsPerPage + itemsPerPage
			);
		}

		return res.status(200).json({
			categories,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query categories for possible parents.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the category to find a parent for.
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
			return res.status(400).send("Invalid category id provided.");

		const query = {};

		if (req.query && req.query.search)
			query["$or"] = [
				{ name: { $regex: req.query.search, $options: "i" } },
				{ alias: { $regex: req.query.search, $options: "i" } },
			];

		if (id !== "all") {
			const category = await CategoryModel.findById(id);

			if (!category)
				return res
					.status(400)
					.send(`No category found with id "${id}"`);

			query._id = { $ne: id };
			query.$or = [
				{ parent: { $exists: false } },
				{ parent: { $ne: id } },
			];
		}

		// Get all categories that are NOT this role, and NOT a direct child of it.
		const categories = flattenDocumentTree(
			await buildDocumentTree(undefined, CategoryModel, query, {
				order: 1,
			})
		);

		// Determine all "path-to-roots" for each category and ensure that the selected role is NOT found in any of them.
		let notReferenced = [];

		if (id === "all") {
			notReferenced = categories;
		} else {
			for (const category of categories) {
				const path = await getPathToDocument(
					category._id,
					CategoryModel,
					"category"
				);
				path.pop(); // Remove the id from the end of the array.

				if (path.includes(id)) continue;

				notReferenced.push(category);
			}
		}

		console.log(req.query, categories);

		return res.status(200).json({
			categories: notReferenced,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Delete a selection of categories.
 */
export const deleteCategories = async (req, res) => {
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

		const categories = await CategoryModel.find(
			stripQuery(req.query)
		).lean();

		if (selection === "all")
			selection = categories
				.filter(({ locked }) => !locked)
				.map(({ _id }) => _id.toString());
		else selection = selection.split(",");

		// Delete all descendants of categories.
		const itemsAndDescendants = flattenDocumentTree(
			await buildDocumentTree(
				await CategoryModel.find({
					_id: { $in: selection },
				}).lean(),
				CategoryModel
			)
		).map(({ _id }) => _id.toString());

		await CategoryModel.deleteMany({
			_id: { $in: itemsAndDescendants },
		});

		return res.status(200).send("Categories deleted successfully.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific category by its ID and position it before another one in the order system.
 * @param {Express.Request} req The API request object.
 * @param {string} req.query.active The ID of the category to move.
 * @param {string} req.query.over The ID of the category to move before.
 * @param {1|-1} req.query.dir The direction to move in.
 */
export const orderCategories = async (req, res) => {
	try {
		const { active, over } = req.query;
		const dir = +req.query.dir || 1;

		await orderDocuments(active, over, dir, CategoryModel, "category");

		return res.status(200).send("User role order change successful.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific category by its ID.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the category to find.
 */
export const findCategoryById = async (req, res) => {
	try {
		const { id } = req.params;

		const category = await CategoryModel.findById(id);

		if (!category)
			return res.status(404).send(`No category found with id "${id}"`);

		return res.status(200).json({ category });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific category by its ID and update it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the category to find.
 * @param {Object} req.body The category update object.
 */
export const findCategoryByIdAndUpdate = async (req, res) => {
	try {
		const { id } = req.params;

		if (req.body._id && id.toString() !== req.body._id.toString())
			return res
				.status(400)
				.send(
					'Request body "_id" parameter does not match request "_id" parameter.'
				);

		const category = await CategoryModel.findById(id);

		if (!category)
			return res.status(404).send(`No category found with id "${id}"`);

		if (category.locked)
			return res
				.status(401)
				.send("You are not authorized to edit locked categories.");

		try {
			req.body = await validateCategory({
				...(await CategoryModel.findById(id).lean()),
				...req.body,
			});
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		// Store new values.
		for (const [key, value] of Object.entries(req.body)) {
			category[key] = value;
		}

		await category.save();

		return res.status(200).json({ category });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
