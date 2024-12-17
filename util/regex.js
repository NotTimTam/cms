/**
 * Used for validating item names.
 */
export const nameRegex = /^.{1,1024}$/;

/**
 * Used for validating item aliases.
 */
export const aliasRegex = /^[a-z0-9_\-]{1,1024}$/;

/**
 * Used for validating email addresses.
 */
export const emailRegex =
	/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

/**
 * Used for validating relative paths.
 */
export const relativePathRegex = /^\/(([A-z0-9\-\%]+\/)*[A-z0-9\-\%]+$)?/;
