import { log, success, warn } from "@nottimtam/console.js";
import UserRoleModel from "../models/users/UserRole.js";

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

/**
 * Ensure that a webmaster exists, and create one if it does not.
 */
export const ensureWebmaster = async () => {
	try {
		log("Checking for Webmaster...");

		let webmasterRole = await UserRoleModel.findOne({ name: "Webmaster" });

		if (!webmasterRole) {
			webmasterRole = new UserRoleModel({
				name: "Webmaster",
				description:
					"System-generated user role, reserved to the webmaster user.",
				locked: true,
			});

			await webmasterRole.save();

			success("Created Webmaster user role.");
		} else if (!webmasterRole.locked) {
			webmasterRole.locked = true;
			await webmasterRole.save();

			warn(
				"Webmaster role was left unlocked, (editable) but has been relocked. While this is generally not a concern, the Webmaster role can only be unlocked through direct database manipulation. If you did not make this change, please verify your system is secure or contact your deployment's webmaster."
			);
		}

		success("Webmaster exists.");
	} catch (error) {
		throw new Error(
			"CRITICAL FAILURE: Failed to ensure a webmaster exists within the database.",
			error
		);
	}
};
