/**
 * A simple interface for interacting with a `Storage` instance, while treating it as JSON data.
 */
export default class StorageInterface {
	/**
	 * Create a new `Storage` instance.
	 * @param {Storage} storageInterface The storage interface to use. Usually `window.localStorage` or `window.sessionStorage`.
	 */
	constructor(storageInterface) {
		if (!storageInterface || !(storageInterface instanceof Storage))
			throw new TypeError("Expected an instance of Storage.");
		this.storageInterface = storageInterface;

		this.__recacheData();
	}

	/**
	 * Internal data storage property. Use `<StorageInterface instance>.data` to access the most up-to-date storage interface data.
	 */
	__rawData = {};

	/**
	 * Internal method for recollecting data from storage interface.
	 */
	__recacheData() {
		this.__rawData =
			Object.fromEntries(
				Object.entries(this.storageInterface).map(([key, value]) => {
					try {
						return [key, JSON.parse(value)];
					} catch (err) {
						return [key, value];
					}
				})
			) || {};
	}

	get data() {
		return this.__rawData;
	}

	set data(obj) {
		this.storageInterface.clear();

		for (const [key, value] of Object.entries(obj)) {
			this.storageInterface.setItem(
				key,
				typeof value === "object" ? JSON.stringify(value) : value
			);
		}

		this.__recacheData();
	}

	/**
	 * Stores data at a specific key in the storage interface.
	 * @param {String} key The key to store the data at.
	 * @param {*} value The data to store. JavaScript objects are allowed.
	 */
	setItem(key, value) {
		this.storageInterface.setItem(
			key,
			typeof value === "object" ? JSON.stringify(value) : value
		);

		this.__recacheData();
	}

	/**
	 * Get data in the storage interface at a specific key.
	 * @param {String} key The key the data is stored at.
	 * @returns {*} The data stored at the provided key, or `null` if no data is found. Plain JavaScript objects will be unserialized.
	 */
	getItem(key) {
		const item = this.storageInterface.getItem(key);

		if (!item) return item;

		try {
			return JSON.parse(item);
		} catch (err) {
			return item;
		}
	}

	/**
	 * Removes all data at a specific key in the storage interface.
	 * @param {String} key The key the data is stored at.
	 */
	removeItem(key) {
		this.storageInterface.removeItem(key);

		this.__recacheData();
	}

	/**
	 * Clears all data in the storage interface.
	 */
	clear() {
		this.storageInterface.clear();

		this.__recacheData();
	}
}
