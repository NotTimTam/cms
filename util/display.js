/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str The string to capitalize the words in.
 * @returns {string} The string, adjusted with each word capitalized.
 */
export const capitalizeWords = (str) =>
	str &&
	str
		.split(" ")
		.map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
		.join(" ");

/**
 * Get the currently active menu item.
 * @param {Object} menu The menu object to search.
 * @param {string} pathname The return of Next.js' `usePathname()` hook.
 * @param {import("next/dist/server/request/search-params").SearchParams} searchParams The return of Next.js' `useSearchParams()` hook.
 * @returns {Object} The menu object. If a menu item's `quickLink` property is active, the menu's `label` element will be appended with the `quickLink`'s `title` property.
 */
export const getCurrentMenu = (menu, pathname, searchParams) => {
	const sortSearchParams = (paramString) =>
		paramString &&
		paramString
			.split("&")
			.sort((a, b) => a.localeCompare(b))
			.filter((item) => !item.includes("id=")) // Remove very specific data from search params.
			.join("&");

	const currentSearchParams = sortSearchParams(searchParams.toString());

	const findMenuMapper = (menu) => {
		const { href, content } = menu;
		if (href && href.includes(pathname)) {
			return menu;
		} else if (content) return content.map(findMenuMapper);
	};

	const possibleMenus = menu
		.map(findMenuMapper)
		.flat()
		.filter((menu) => menu);

	if (!currentSearchParams)
		return possibleMenus.find(({ href }) => href === pathname);

	return possibleMenus
		.map((menu) => {
			const menuSearchParams =
				menu.href.split("?")[1] &&
				sortSearchParams(menu.href.split("?")[1]);

			const quickLinkSearchParams =
				menu.quickLink &&
				menu.quickLink.href.split("?")[1] &&
				sortSearchParams(menu.quickLink.href.split("?")[1]);

			if (menuSearchParams && menuSearchParams === currentSearchParams)
				return menu;
			else if (
				quickLinkSearchParams &&
				quickLinkSearchParams === currentSearchParams
			) {
				return {
					...menu,
					alt: (
						<>
							{menu.alt || menu.title}:{" "}
							{
								menu.quickLink.title[
									searchParams.has("id") ? "existing" : "new"
								]
							}
						</>
					),
				};
			}
		})
		.filter((menu) => menu)[0];
};

/**
 * Create a depth indicator for parent/child nesting systems.
 * @param {number} depth The level of depth to indicate.
 * @returns {string} A string-based depth indicator.
 */
export const depthIndicator = (depth) => "\u2013 ".repeat(depth).trim();
