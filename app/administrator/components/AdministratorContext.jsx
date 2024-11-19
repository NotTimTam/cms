"use client";

import {
	Blocks,
	CircleHelp,
	FileCode2,
	FileLock2,
	FileText,
	FolderClosed,
	Home,
	Images,
	List,
	Logs,
	Menu,
	Package,
	Parentheses,
	Plus,
	SquareStack,
	Tags,
	TextCursorInput,
	User,
	Users,
	Wrench,
} from "lucide-react";
import { createContext, useState } from "react";

/**
 * Create the administrator side menu.
 * @param {Array} siteMenus Array of the menus on the site.
 * @param {Array} sitePlugins Array of the plugins on the site.
 * @returns {Array} A menu array to be rendered for administrator.
 */
const menu = (siteMenus, sitePlugins) =>
	[
		{
			type: "a",
			title: "Home Dashboard",
			icon: <Home />,
			label: "Home Dashboard",
			href: "/administrator/dashboard",
		},

		{
			type: "s",
			title: "Content",
			icon: (
				<>
					<FolderClosed />
				</>
			),
			content: [
				{
					type: "a",
					title: "Articles",
					icon: (
						<>
							<FileText />
						</>
					),
					href: "/administrator/dashboard/articles",
					quickLink: {
						title: {
							new: "Create New Article",
							existing: "Edit Article",
						},
						icon: <Plus />,
						href: "/administrator/dashboard/articles?layout=edit",
						ariaLabel: "Create New Article",
					},
				},
				{
					type: "a",
					title: "Categories",
					icon: (
						<>
							<SquareStack />
						</>
					),
					href: "/administrator/dashboard/categories",
					quickLink: {
						title: {
							new: "Create New Category",
							existing: "Edit Category",
						},
						icon: <Plus />,
						href: "/administrator/dashboard/categories?layout=edit",
						ariaLabel: "Create New Category",
					},
				},
				{
					type: "a",
					title: "Tags",
					icon: (
						<>
							<Tags />
						</>
					),
					href: "/administrator/dashboard/tags",
					quickLink: {
						title: {
							new: "Create New Tag",
							existing: "Edit Tag",
						},
						icon: <Plus />,
						href: "/administrator/dashboard/tags?layout=edit",
						ariaLabel: "Create New Tag",
					},
				},
				{
					type: "d",
				},
				{
					type: "a",
					title: "Fields",
					icon: (
						<>
							<TextCursorInput />
						</>
					),
					href: "/administrator/dashboard/fields",
				},
				{
					type: "a",
					title: "Field Groups",
					icon: (
						<>
							<Parentheses />
						</>
					),
					href: "/administrator/dashboard/fields?view=groups",
				},
				{
					type: "d",
				},
				{
					type: "a",
					title: "Media",
					icon: (
						<>
							<Images />
						</>
					),
					href: "/administrator/dashboard/media",
				},
				{
					type: "a",
					title: "Modules",
					icon: (
						<>
							<FileCode2 />
						</>
					),
					href: "/administrator/dashboard/modules",
					quickLink: {
						title: {
							new: "Create New Module",
							existing: "Edit Module",
						},
						icon: <Plus />,
						href: "/administrator/dashboard/modules?layout=edit",
						ariaLabel: "Create New Module",
					},
				},
			],
		},

		{
			type: "s",
			title: "Menus",
			icon: (
				<>
					<Menu />
				</>
			),
			content: [
				{
					type: "a",
					title: "Manage",
					alt: "Manage Menus",
					icon: (
						<>
							<Logs />
						</>
					),
					href: "/administrator/dashboard/menus",
				},
				{
					type: "a",
					title: "Menu Items",
					icon: (
						<>
							<List />
						</>
					),
					href: "/administrator/dashboard/menus?view=items",
				},
				...(siteMenus && siteMenus.length > 0
					? [{ type: "d" }, ...siteMenus]
					: []),
			],
		},

		{
			type: "s",
			title: "Plugins",
			icon: (
				<>
					<Blocks />
				</>
			),
			content: [
				{
					type: "a",
					title: "Manage",
					alt: "Manage Plugins",
					icon: (
						<>
							<Package />
						</>
					),
					href: "/administrator/dashboard/plugins",
				},
			],
		},

		{
			type: "s",
			title: "Users",
			icon: (
				<>
					<Users />
				</>
			),
			content: [
				{
					type: "a",
					title: "Manage",
					alt: "Manage Users",
					icon: (
						<>
							<User />
						</>
					),
					href: "/administrator/dashboard/users",
					quickLink: {
						title: {
							new: "Create New User",
							existing: "Edit User",
						},
						icon: <Plus />,
						href: "/administrator/dashboard/users?layout=edit",
						ariaLabel: "Create New User",
					},
				},
				{
					type: "a",
					title: "Roles",
					alt: "User Roles",
					icon: (
						<>
							<FileLock2 />
						</>
					),
					href: "/administrator/dashboard/users?view=roles",
					quickLink: {
						title: {
							new: "Create New Role",
							existing: "Edit Role",
						},
						icon: <Plus />,
						href: "/administrator/dashboard/users?view=roles&layout=edit",
						ariaLabel: "Create New Role",
					},
				},
				{
					type: "d",
				},
				{
					type: "a",
					title: "Fields",
					alt: "User Fields",
					icon: (
						<>
							<TextCursorInput />
						</>
					),
					href: "/administrator/dashboard/users?view=fields",
				},
				{
					type: "a",
					title: "Field Groups",
					alt: "User Field Groups",
					icon: (
						<>
							<Parentheses />
						</>
					),
					href: "/administrator/dashboard/users?view=fieldgroups",
				},
			],
		},

		{
			type: "a",
			title: "System",
			icon: (
				<>
					<Wrench />
				</>
			),
			href: "/administrator/dashboard/system",
		},

		{
			type: "a",
			title: "Help",
			icon: (
				<>
					<CircleHelp />
				</>
			),
			href: "/administrator/dashboard/help",
		},
	].filter((menuItem) => menuItem);

/**
 * The AdministratorContext provides an array with these properties:
 * - `state` &mdash; An array containing state components for updating the current React state for the administrator pages.
 * 	- `administrator` &mdash; The administrator data object.
 * 	- `setAdministrator` &mdash; A method for replacing the administrator data object.
 * - `menu` &mdash; An array of objects for defining the administrator menu structure.
 */
export const AdministratorContext = createContext(null);

export default function AdministratorContextProvider({ children }) {
	const [administrator, setAdministrator] = useState({
		sideMenu: {
			expanded: true,
			sections: {},
		},
	});

	return (
		<AdministratorContext.Provider
			value={{
				menu: menu(),
				state: [administrator, setAdministrator],
			}}
		>
			{children}
		</AdministratorContext.Provider>
	);
}
