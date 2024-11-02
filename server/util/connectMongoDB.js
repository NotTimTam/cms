import { error, success } from "@nottimtam/console.js";
import mongoose from "mongoose";

const connectMongoDB = async () => {
	try {
		if (!process.env.MONGODB)
			throw new Error(
				'No "MONGODB" variable configured in environment. Expected a valid MongoDB connection string.'
			);

		await mongoose
			.connect(process.env.MONGODB)
			.finally(success("Connected to MongoDB database"));
	} catch (err) {
		error(err);

		process.exit(1);
	}
};

export default connectMongoDB;
