import { error, success } from "@nottimtam/console.js";
import mongoose from "mongoose";
import GlobalConfigurationModel from "../models/GlobalConfigurationModel.js";
import { defaultGlobalConfiguration } from "../../util/data.js";

/**
 * Connect to the MongoDB database.
 * @returns {Promise} A promise containing the connection object returned by mongoose.
 */
export const connectMongoDB = () => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!process.env.MONGODB) {
				throw new Error(
					'No "MONGODB" variable configured in environment. Expected a valid MongoDB connection string.'
				);
			}

			await mongoose.connect(process.env.MONGODB);

			success("Connected to MongoDB database");

			resolve(mongoose.connection);
		} catch (err) {
			error(err);

			reject(err);
			process.exit(1);
		}
	});
};

/**
 * **SYSTEM UTIL**
 */
export const SERVER__getGlobalConfiguration = async () => {
	if (mongoose.connection.readyState !== 1)
		throw new Error(
			"Request failed: mongoose has not connected to MongoDB."
		);

	return (
		(await GlobalConfigurationModel.findOne({}).lean()) ||
		defaultGlobalConfiguration
	);
};
