import {
	buildDocumentTree,
	flattenDocumentTree,
	getPathToDocument,
	orderDocuments,
} from "../../util/database.js";
import TagModel from "../../models/content/TagModel.js";
import { handleUnexpectedError } from "../../util/controller.js";
import {
	validateTag,
	ResError,
	validateNestQuery,
	validateGenericQuery,
	stripQuery,
} from "../../util/validators.js";
import mongoose from "mongoose";
import { stripMongoDBFieldsFromBody } from "../../util/data.js";

/**
 * Create a new Tag document.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createTag = async (req, res) => {
	try {
		const {
			user: { _id: author },
		} = req;

		req.body.author = author;

		const roleWithHighestOrder = await TagModel.findOne({}).sort({
			order: -1,
		});

		req.body.order = roleWithHighestOrder
			? roleWithHighestOrder.order + 1
			: 0;

		try {
			req.body = await validateTag(stripMongoDBFieldsFromBody(req.body));
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		const tag = new TagModel(req.body);

		await tag.save();

		return res.status(200).json({ tag });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query tags irrespective of their parent/child relationships.
 */
export const findTags = async (req, res) => {
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

		const numRoles = await TagModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numRoles : +itemsPerPage;

		const numPages = Math.ceil(numRoles / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		const tags = await TagModel.find(query)
			.sort({ [sortField]: +sortDir })
			.limit(+itemsPerPage)
			.skip(page * +itemsPerPage)
			.lean();

		for (const tag of tags) {
			const path = await getPathToDocument(tag._id, TagModel, "tag");
			path.pop(); // Remove the id from the end of the array.

			tag.depth = path.length;
		}

		return res.status(200).json({
			tags,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query tags in a tree format.
 */
export const getTagTree = async (req, res) => {
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

		const numRoles = await TagModel.countDocuments(query);

		itemsPerPage = itemsPerPage === "all" ? numRoles : +itemsPerPage;

		const numPages = Math.ceil(numRoles / itemsPerPage);

		page = +page;

		if (page > numPages - 1) page = numPages - 1;
		if (page < 0) page = 0;

		let tags = [];
		if (!root) {
			query.parent = { $exists: false }; // Filter to just root items.
			tags = await TagModel.find(query)
				.sort({ [sortField]: +sortDir })
				.lean();

			delete query.parent;
		} else {
			query._id = root;
			const rootTag = await TagModel.findOne(query).lean();

			if (rootTag) tags = [rootTag];

			delete query._id;
		}

		if (tags && tags.length > 0) {
			// Build document tree.
			tags = await buildDocumentTree(
				tags,
				TagModel,
				query,
				{ [sortField]: +sortDir },
				"",
				depth
			);

			// Flatten document tree.
			tags = flattenDocumentTree(tags).slice(
				page * itemsPerPage,
				page * itemsPerPage + itemsPerPage
			);
		}

		return res.status(200).json({
			tags,
			page,
			numPages,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Query tags for possible parents.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the tag to find a parent for.
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
			return res.status(400).send("Invalid tag id provided.");

		const query = {};

		if (req.query && req.query.search)
			query["$or"] = [
				{ name: { $regex: req.query.search, $options: "i" } },
				{ alias: { $regex: req.query.search, $options: "i" } },
			];

		if (id !== "all") {
			const tag = await TagModel.findById(id);

			if (!tag)
				return res.status(400).send(`No tag found with id "${id}"`);

			query._id = { $ne: id };
			query.$or = [
				{ parent: { $exists: false } },
				{ parent: { $ne: id } },
			];
		}

		// Get all tags that are NOT this role, and NOT a direct child of it.
		const tags = flattenDocumentTree(
			await buildDocumentTree(undefined, TagModel, query, {
				order: 1,
			})
		);

		// Determine all "path-to-roots" for each tag and ensure that the selected role is NOT found in any of them.
		let notReferenced = [];

		if (id === "all") {
			notReferenced = tags;
		} else {
			for (const tag of tags) {
				const path = await getPathToDocument(tag._id, TagModel, "tag");
				path.pop(); // Remove the id from the end of the array.

				if (path.includes(id)) continue;

				notReferenced.push(tag);
			}
		}

		return res.status(200).json({
			tags: notReferenced,
		});
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Delete a selection of tags.
 */
export const deleteTags = async (req, res) => {
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

		const tags = await TagModel.find(stripQuery(req.query)).lean();

		if (selection === "all")
			selection = tags.map(({ _id }) => _id.toString());
		else selection = selection.split(",");

		// Delete all descendants of tags.
		const itemsAndDescendants = flattenDocumentTree(
			await buildDocumentTree(
				await TagModel.find({
					_id: { $in: selection },
				}).lean(),
				TagModel
			)
		).map(({ _id }) => _id.toString());

		await TagModel.deleteMany({
			_id: { $in: itemsAndDescendants },
		});

		return res.status(200).send("Tags deleted successfully.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific tag by its ID and position it before another one in the order system.
 * @param {Express.Request} req The API request object.
 * @param {string} req.query.active The ID of the tag to move.
 * @param {string} req.query.over The ID of the tag to move before.
 * @param {1|-1} req.query.dir The direction to move in.
 */
export const orderTags = async (req, res) => {
	try {
		const { active, over } = req.query;
		const dir = +req.query.dir || 1;

		await orderDocuments(active, over, dir, TagModel, "tag");

		return res.status(200).send("role order change successful.");
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific tag by its ID.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the tag to find.
 */
export const findTagById = async (req, res) => {
	try {
		const { id } = req.params;

		const tag = await TagModel.findById(id);

		if (!tag) return res.status(404).send(`No tag found with id "${id}"`);

		return res.status(200).json({ tag });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

/**
 * Find a specific tag by its ID and update it.
 * @param {Express.Request} req The API request object.
 * @param {string} req.params.id The ID of the tag to find.
 * @param {Object} req.body The tag update object.
 */
export const findTagByIdAndUpdate = async (req, res) => {
	try {
		const { id } = req.params;

		if (req.body._id && id.toString() !== req.body._id.toString())
			return res
				.status(400)
				.send(
					'Request body "_id" parameter does not match request "_id" parameter.'
				);

		const tag = await TagModel.findById(id);

		if (!tag) return res.status(404).send(`No tag found with id "${id}"`);

		try {
			req.body = await validateTag({
				...(await TagModel.findById(id).lean()),
				...stripMongoDBFieldsFromBody(req.body),
			});
		} catch (error) {
			if (error instanceof ResError)
				return res.status(error.code).send(error.message);
			else throw error;
		}

		// Store new values.
		for (const [key, value] of Object.entries(req.body)) {
			tag[key] = value;
		}

		await tag.save();

		return res.status(200).json({ tag });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};
