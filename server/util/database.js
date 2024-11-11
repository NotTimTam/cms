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

	const nearestModel = await Model.findOne({
		order: dir === 1 ? { $gt: overModel.order } : { $lt: overModel.order },
	}).sort({ order: dir });

	// Find a halfway point (or if none, the position before/after) the "over" item.
	activeModel.order = nearestModel
		? (nearestModel.order + overModel.order) / 2
		: overModel.order + dir;
	await activeModel.save();

	// Normalize the order across all items.
	const allItems = await Model.find({}).sort({ order: 1 });
	await Model.bulkWrite(
		allItems.map((item, index) => ({
			updateOne: {
				filter: { _id: item._id },
				update: { $set: { order: index } },
			},
		}))
	);
};
