"use client";

import {
	Blocks,
	CircleHelp,
	FileCode2,
	FileText,
	FolderClosed,
	Home,
	Images,
	List,
	Logs,
	Menu,
	Notebook,
	Parentheses,
	Plus,
	SquareStack,
	Tags,
	TextCursorInput,
	Users,
	Wrench,
} from "lucide-react";
import { createContext, useState } from "react";

/**
 * Create the administrator side menu.
 * @param {Array} siteMenus Array of the menus on the site.
 * @param {Array} siteExtensions Array of the extensions on the site.
 * @returns {Array} A menu array to be rendered for administrator.
 */
const menu = (siteMenus, siteExtensions) =>
	[
		{
			type: "a",
			title: "Home Dashboard",
			label: (
				<>
					<Home />
					<span>Home Dashboard</span>
				</>
			),
			href: "/administrator/dashboard",
		},

		{
			type: "s",
			title: "Content",
			label: (
				<>
					<FolderClosed />
					<span>Content</span>
				</>
			),
			content: [
				{
					type: "a",
					title: "Articles",
					label: (
						<>
							<FileText />
							<span>Articles</span>
						</>
					),
					href: "/administrator/dashboard/articles",
					quickLink: {
						icon: <Plus />,
						href: "/administrator/dashboard/articles?layout=edit",
						ariaLabel: "Create New Article",
					},
				},
				{
					type: "a",
					title: "Categories",
					label: (
						<>
							<SquareStack />
							<span>Categories</span>
						</>
					),
					href: "/administrator/dashboard/categories",
					quickLink: {
						icon: <Plus />,
						href: "/administrator/dashboard/categories?layout=edit",
						ariaLabel: "Create New Category",
					},
				},
				{
					type: "a",
					title: "Tags",
					label: (
						<>
							<Tags />
							<span>Tags</span>
						</>
					),
					href: "/administrator/dashboard/tags",
					quickLink: {
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
					label: (
						<>
							<TextCursorInput />
							<span>Fields</span>
						</>
					),
					href: "/administrator/dashboard/fields",
				},
				{
					type: "a",
					title: "Field Groups",
					label: (
						<>
							<Parentheses />
							<span>Field Groups</span>
						</>
					),
					href: "/administrator/dashboard/fieldgroups",
				},
				{
					type: "d",
				},
				{
					type: "a",
					title: "Media",
					label: (
						<>
							<Images />
							<span>Media</span>
						</>
					),
					href: "/administrator/dashboard/media",
				},
				{
					type: "a",
					title: "Modules",
					label: (
						<>
							<FileCode2 />
							<span>Modules</span>
						</>
					),
					href: "/administrator/dashboard/modules",
					quickLink: {
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
			label: (
				<>
					<Menu />
					<span>Menus</span>
				</>
			),
			content: [
				{
					type: "a",
					title: "Menus",
					label: (
						<>
							<Logs />
							<span>Manage</span>
						</>
					),
					href: "/administrator/dashboard/menus",
				},
				{
					type: "a",
					title: "Menu Items",
					label: (
						<>
							<List />
							<span>Menu Items</span>
						</>
					),
					href: "/administrator/dashboard/menus/items",
				},
				...(siteMenus && siteMenus.length > 0
					? [{ type: "d" }, ...siteMenus]
					: []),
			],
		},

		siteExtensions &&
			siteExtensions.length > 0 && {
				type: "s",
				title: "Extensions",
				label: (
					<>
						<Blocks />
						<span>Extensions</span>
					</>
				),
			},

		{
			type: "s",
			title: "Users",
			label: (
				<>
					<Users />
					<span>Users</span>
				</>
			),
			content: [
				{
					type: "a",
					title: "Manage",
					label: (
						<>
							<FileText />
							<span>Manage</span>
						</>
					),
					href: "/administrator/dashboard/users",
					quickLink: {
						icon: <Plus />,
						href: "/administrator/dashboard/users?layout=edit",
						ariaLabel: "Create New User",
					},
				},
				{
					type: "a",
					title: "User Groups",
					label: (
						<>
							<FileText />
							<span>Groups</span>
						</>
					),
					href: "/administrator/dashboard/users/groups",
				},
				{
					type: "a",
					title: "User Roles",
					label: (
						<>
							<FileText />
							<span>Roles</span>
						</>
					),
					href: "/administrator/dashboard/users/roles",
				},
				{
					type: "d",
				},
				{
					type: "a",
					title: "Fields",
					label: (
						<>
							<TextCursorInput />
							<span>Fields</span>
						</>
					),
					href: "/administrator/dashboard/users/fields",
				},
				{
					type: "a",
					title: "Field Groups",
					label: (
						<>
							<Parentheses />
							<span>Field Groups</span>
						</>
					),
					href: "/administrator/dashboard/users/fieldgroups",
				},
			],
		},

		{
			type: "a",
			title: "System",
			label: (
				<>
					<Wrench />
					<span>System</span>
				</>
			),
			href: "/administrator/dashboard/system",
		},

		{
			type: "a",
			title: "Help",
			label: (
				<>
					<CircleHelp />
					<span>Help</span>
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
