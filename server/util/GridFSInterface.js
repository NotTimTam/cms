import { success } from "@nottimtam/console.js";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";

/**
 * Utilities for interfacing with GridFS data on the MongoDB database.
 */
export default class GridFSInterface {
	/**
	 * Create a new `GridFSInterface` instance.
	 */
	constructor() {
		mongoose.connection.once("open", () => {
			success("GridFS interface ready.");
		});
	}

	/**
	 * **FOR INTERNAL USE**
	 */
	__catchNotReady() {
		if (!this.ready)
			throw new Error(
				"GridFSInterface is not ready. Ensure mongoose has connected to MongoDB."
			);
	}

	/**
	 * Returns `true` if the connection is ready.
	 */
	get ready() {
		return mongoose.connection.readyState === 1;
	}

	/**
	 * Get a bucket by name.
	 * @param {string} name The name of the bucket.
	 * @returns {GridFSBucket} The bucket with this name.
	 */
	getBucket(name) {
		this.__catchNotReady();

		return new GridFSBucket(mongoose.connection.db, {
			bucketName: name,
		});
	}

	/**
	 * Get a file collection for querying.
	 * @param {string} name The name of the bucket to get the file collection for.
	 * @returns {mongoose.Collection}
	 */
	getCollection(name) {
		this.__catchNotReady();

		mongoose.connection.db.collection(`${name}.files`);
	}

	/**
	 * Upload a file to the database.
	 * @param {String} name The name of the file.
	 * @param {*} data The data to store in the file.
	 * @param {String} bucket The name of the bucket to store the file in.
	 * @param {Array|Object} metadata Optional metadata for file.
	 * @param {String} encoding The buffer encoding mode. Defaults to `"utf-8"`.
	 * @returns {Promise<null>}
	 */
	uploadFile(name, data, bucket, metadata, encoding = "utf-8") {
		this.__catchNotReady();

		return new Promise(async (resolve, reject) => {
			try {
				const gridFSBucket = this.getBucket(bucket);

				const buffer = Buffer.from(data, encoding);

				const stream = gridFSBucket.openUploadStream(name, {
					metadata,
				});

				stream.write(buffer, (error) => {
					if (error) throw error;
				});

				stream.end(() => {
					resolve(null);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	findByNameAndDownload(name, bucket) {
		this.__catchNotReady();

		return new Promise(async (resolve, reject) => {
			try {
				const gridFSBucket = this.getBucket(bucket);

				const downloadStream =
					gridFSBucket.openDownloadStreamByName(name);
			} catch (error) {
				reject(error);
			}
		});
	}

	findByIdAndDelete(id, bucket) {
		this.__catchNotReady();

		return new Promise(async (resolve, reject) => {
			try {
				const gridFSBucket = this.getBucket(bucket);

				gridFSBucket.delete(ObjectId(id), (error) => {
					if (error) throw error;
					else resolve();
				});
			} catch (error) {
				reject(error);
			}
		});
	}
}
