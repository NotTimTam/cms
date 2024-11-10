import UserRoleModel from "../../models/users/UserRole.js";
import { nameRegex } from "../../../util/regex.js";
import { handleUnexpectedError } from "../../util/controller.js";
import { validateGenericQuery } from "../../util/validators.js";

/**
 * Create a new UserRole document.
 * @param {Express.Request} req The API request object.
 * @param {Object} req.body The user creation object.
 */
export const createUserRole = async (req, res) => {
	try {
		const { name, description } = req.body;

		if (!name) return res.status(400).send("No role name provided.");
		if (typeof name !== "string" || !nameRegex.test(name))
			return res
				.status(400)
				.send(
					`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
				);
		if (await UserRoleModel.findOne({ name }))
			return res
				.status(400)
				.send("A role already exists with that name.");

		if (description && typeof description !== "string")
			return res.status(400).send("Invalid description provided.");

		const roleWithHighestOrder = await UserRoleModel.findOne({}).sort({
			order: -1,
		});

		const role = new UserRoleModel({
			name,
			description,
			order: roleWithHighestOrder ? roleWithHighestOrder.order + 1 : 0,
		});

		await role.save();

		return res.status(200).json({ role });
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

export const findUserRoleByIdAndUpdate = async (req, res) => {};

/**
 * Patch a selection of user roles.
 */
export const batchUserRoles = async (req, res) => {
	try {
		// const { name, description } = req.body;
		// if (!name) return res.status(400).send("No role name provided.");
		// if (typeof name !== "string" || !nameRegex.test(name))
		// 	return res
		// 		.status(400)
		// 		.send(
		// 			`Invalid name provided. Expected a string between 1 and 1024 characters in length.`
		// 		);
		// // if (await UserRoleModel.findOne({ name }))
		// // 	return res
		// // 		.status(400)
		// // 		.send("A role already exists with that name.");
		// if (description && typeof description !== "string")
		// 	return res.status(400).send("Invalid description provided.");
		// try {
		// 	req.query = await validateGenericQuery(req.query);
		// } catch (error) {
		// 	if (error instanceof ValidatorError)
		// 		return res.status(error.code).send(error.message);
		// 	else throw error;
		// }
		// const { search } = req.query;
		// let { selection } = req.query;
		// if (!selection)
		// 	return res
		// 		.status(400)
		// 		.send('No "selection" parameter provided in query.');
		// const query = {};
		// if (search)
		// 	query["$or"] = [
		// 		{ name: { $regex: search, $options: "i" } },
		// 		{ alias: { $regex: search, $options: "i" } },
		// 	];
		// const articles = await ArticleModel.find(query)
		// 	.select("+status")
		// 	.lean();
		// if (selection === "all")
		// 	selection = articles.map(({ _id }) => _id.toString());
		// else selection = selection.split(",");
		// const updatedArticles = [];
		// for (const id of selection) {
		// 	const article = await ArticleModel.findById(id);
		// 	if (!article)
		// 		return res.status(404).send(`No article found with ID "${id}"`);
		// 	for (const [key, value] of Object.entries(req.body)) {
		// 		article[key] = value;
		// 	}
		// 	await article.save();
		// 	updatedArticles.push(article);
		// }
		// return res.status(200).json({ articles: updatedArticles });
	} catch (error) {
		return handleUnexpectedError(res, error);
	}
};

export const findUserRoleByIdAndDelete = async (req, res) => {};
