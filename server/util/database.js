import { ResError } from "./validators.js";

/**
 * Reorder a database Model's documents.
 * @param {string} active The ID of the document being moved.
 * @param {string} over The ID of the document `active` is moving before/after.
 * @param {-1|1} dir The side of the `over` document that the `active` document should be placed at. `-1` is before, `1` is after.
 * @param {Mongoose.Model} Model The `mongoose` Model object used for document sorting. Must have an `order` integer field which will be used for this.
 * @param {string} label A label to identify the content being reordered, in error messages.
 */
export const orderDocuments = async (
	active,
	over,
	dir = 1,
	Model,
	label = "document"
) => {
	if (dir !== 1 && dir !== -1)
		return res
			.status(400)
			.send('Invalid "dir" provided to query. Expected 1 or -1.');

	const activeModel = await Model.findById(active);
	if (!activeModel)
		return res.status(404).send(`No ${label} found with id "${active}"`);

	const overModel = await Model.findById(over);
	if (!overModel)
		return res.status(404).send(`No user ${label} found with id "${over}"`);

	const nearestQuery = {
		order: dir === 1 ? { $gt: overModel.order } : { $lt: overModel.order },
	};
	if (activeModel.parent && overModel.parent)
		nearestQuery.parent = activeModel.parent;

	const nearestModel = await Model.findOne(nearestQuery).sort({ order: dir });

	// Find a halfway point (or if none, the position before/after) the "over" item.
	activeModel.order = nearestModel
		? (nearestModel.order + overModel.order) / 2
		: overModel.order + dir;
	await activeModel.save();

	// Normalize the order across all items.
	const allItemsQuery = {};
	if (activeModel.parent && overModel.parent)
		allItemsQuery.parent = activeModel.parent;
	const allItems = await Model.find(allItemsQuery).sort({ order: 1 });
	await Model.bulkWrite(
		allItems.map((item, index) => ({
			updateOne: {
				filter: { _id: item._id },
				update: { $set: { order: index } },
			},
		}))
	);
};

/**
 * Get the path from the root level to a document.
 * @param {string} id The id of the document to get the path to.
 * @param {Mongoose.Model} Model The mongoose Model for the document tree.
 * @param {string} label A label to identify the content being reordered, in error messages.
 * @returns {string[]} An array of document ids, the first being a top-level document, and the last being the requested document.
 */
export const getPathToDocument = async (
	id,
	Model,
	label = "document",
	__ = []
) => {
	const document = await Model.findById(id);

	if (!document) throw new ResError(404, `No ${label} found with id "${id}"`);

	__.unshift(document._id.toString());

	if (document.parent)
		return await getPathToDocument(document.parent, Model, label, __);

	return __;
};

/**
 * Get the child documents of a document using the parent/child system.
 * @param {string} id The id of the document to get the children of.
 * @param {Mongoose.Model} Model The mongoose Model for the document tree.
 * @param {string} label A label to identify the content being reordered, in error messages.
 * @returns {Array} An array of document children.
 */
export const getDocumentChildren = async (id, Model, label = "document") => {
	const document = await Model.findById(id);

	if (!document) throw new ResError(404, `No ${label} found with id "${id}"`);

	return await Model.find({ parent: id });
};

/**
 * Create a full document tree.
 * @param {Array} group An array of (lean) documents to build from.
 * @param {Mongoose.Model} Model The mongoose Model for the document tree.
 * @param {Object} query An optional query object for filtration.
 * @param {Object} sort Optional sorting parameters.
 * @param {string|Object} select Optional document select string for appending items to documents.
 * @param {number} maxDepth The maximum depth to drill for tree building.
 * @returns {Array} An array of documents. Each document within children will have a `"children"` field containing them.
 */
export const buildDocumentTree = async (
	group,
	Model,
	query = {},
	sort = { createdAt: 1 },
	select = "",
	maxDepth
) => {
	let curDepth = 0;
	if (!group) {
		// Find all root level documents.
		group = await Model.find({
			...query,
			parent: { $exists: false },
		})
			.select(select)
			.sort(sort)
			.lean();
	}

	const collectChildren = async (document, d) => {
		document.children = await Model.find({
			...query,
			parent: document._id,
		})
			.select(select)
			.sort(sort)
			.lean();

		curDepth = d;

		if (!isNaN(maxDepth) && curDepth >= maxDepth) return; // End once max depth is reached.

		for (const child of document.children)
			await collectChildren(child, d + 1);
	};

	for (const document of group) await collectChildren(document, 0);

	return group;
};

/**
 * Flatten document tree.
 * @param {Array<Object>} documents The documents to flatten.
 */
export const flattenDocumentTree = (documents) => {
	let newTree = [];

	const flattenDocument = (document, depth) => {
		let children = [];
		if (document.children) {
			children = [...document.children];
			delete document.children;
		}

		newTree.push({ ...document, depth });

		for (const child of children) flattenDocument(child, depth + 1);
	};

	for (const document of documents) flattenDocument(document, 0);

	return newTree;
};

/**
 * A query object that will return only objects that are not "locked".
 */
export const unlockedQuery = {
	$or: [{ locked: { $exists: false } }, { locked: false }],
};
