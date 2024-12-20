import { error, success } from "@nottimtam/console.js";
import mongoose from "mongoose";

/**
 * Connect to the MongoDB database.
 * @returns {Promise} A promise containing the connection object returned by mongoose.
 */
const connectMongoDB = () => {
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

export default connectMongoDB;
