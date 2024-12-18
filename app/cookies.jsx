"use server";

import { cookies } from "next/headers";
import { redirect as redir } from "next/navigation";

/**
 * Get the authentication token cookie.
 * @returns {string|undefined} The token or `undefined` if one doesn't exist.
 */
export async function getToken() {
	const token = (await cookies()).get("token");
	return token && token.value;
}

/**
 * Store an authentication token cookie.
 * @param {String} token The token to set.
 * @param {String} redirect An optional URL to redirect to.
 */
export async function setToken(token, redirect) {
	(await cookies()).set("token", token, { maxAge: 1000 * 60 * 60 * 24 * 7 });

	if (redirect) redir(redirect);
}

/**
 * Delete the user's token.
 * @param {String} redirect An optional URL to redirect to.
 */
export async function deleteToken(redirect) {
	(await cookies()).delete("token");

	if (redirect) redir(redirect);
}
