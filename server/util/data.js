/**
 * Remove MongoDB-specific fields from a request object.
 * @param {Object} body The request body.
 * @returns {Object} The filtered body object.
 */
export const stripMongoDBFieldsFromBody = (body) => {
	if (!body) return body;

	delete body._id;
	delete body.createdAt;
	delete body.updatedAt;
	delete body.__v;

	return body;
};
