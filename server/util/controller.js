import { error } from "@nottimtam/console.js";
import { MongooseError } from "mongoose";

export const handleUnexpectedError = (res, err) => {
	error("An unexpected error has occured:", err);

	return res
		.status(500)
		.send(
			"An unexpected server-side error occured. Please try again later."
		);
};
