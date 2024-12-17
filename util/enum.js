/**
 * Enum for handling content status.
 */
export const statusEnum = ["published", "unpublished", "trashed", "archived"];

/**
 * Enum for sortField validation.
 */
export const sortEnum = [
	"order",
	"featured",
	"status",
	"name",
	"access",
	"author",
	"createdAt",
	"hits",
];

/**
 * Enum for message types.
 */
export const messageTypeEnum = ["error", "warning", "success", "info"];

/**
 * Enum for robots.txt configurations.
 */
export const robotsEnum = [
	"index, follow",
	"noindex, follow",
	"index, nofollow",
	"noindex, nofollow",
];
