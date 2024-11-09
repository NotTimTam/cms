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
	Package,
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
 * @param {Array} sitePlugins Array of the plugins on the site.
 * @returns {Array} A menu array to be rendered for administrator.
 */
const menu = (siteMenus, sitePlugins) =>
	[
		{
			type: "a",
			title: "Home Dashboard",
			label: (
				<>
					<Home />
					Home Dashboard
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
					Content
				</>
			),
			content: [
				{
					type: "a",
					title: "Articles",
					label: (
						<>
							<FileText />
							Articles
						</>
					),
					href: "/administrator/dashboard/articles",
					quickLink: {
						title: "Create New Article",
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
							Categories
						</>
					),
					href: "/administrator/dashboard/categories",
					quickLink: {
						title: "Create New Category",
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
							Tags
						</>
					),
					href: "/administrator/dashboard/tags",
					quickLink: {
						title: "Create New Tag",
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
							Fields
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
							Field Groups
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
					label: (
						<>
							<Images />
							Media
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
							Modules
						</>
					),
					href: "/administrator/dashboard/modules",
					quickLink: {
						title: "Create New Module",
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
					Menus
				</>
			),
			content: [
				{
					type: "a",
					title: "Manage",
					label: (
						<>
							<Logs />
							Manage Menus
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
							Menu Items
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
			label: (
				<>
					<Blocks />
					Plugins
				</>
			),
			content: [
				{
					type: "a",
					title: "Manage",
					label: (
						<>
							<Package />
							Manage Plugins
						</>
					),
					href: "/administrator/dashboard/plugins",
				},
			],
		},

		{
			type: "s",
			title: "Users",
			label: (
				<>
					<Users />
					Users
				</>
			),
			content: [
				{
					type: "a",
					title: "Manage",
					label: (
						<>
							<FileText />
							Manage Users
						</>
					),
					href: "/administrator/dashboard/users",
					quickLink: {
						title: "Create New User",
						icon: <Plus />,
						href: "/administrator/dashboard/users?layout=edit",
						ariaLabel: "Create New User",
					},
				},
				{
					type: "a",
					title: "Groups",
					label: (
						<>
							<FileText />
							User Groups
						</>
					),
					href: "/administrator/dashboard/users?view=groups",
					quickLink: {
						title: "Create New Group",
						icon: <Plus />,
						href: "/administrator/dashboard/users?view=groups&layout=edit",
						ariaLabel: "Create New Group",
					},
				},
				{
					type: "a",
					title: "Roles",
					label: (
						<>
							<FileText />
							User Roles
						</>
					),
					href: "/administrator/dashboard/users?view=roles",
					quickLink: {
						title: "Create New Role",
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
					label: (
						<>
							<TextCursorInput />
							Fields
						</>
					),
					href: "/administrator/dashboard/users?view=fields",
				},
				{
					type: "a",
					title: "Field Groups",
					label: (
						<>
							<Parentheses />
							Field Groups
						</>
					),
					href: "/administrator/dashboard/users?view=fieldgroups",
				},
			],
		},

		{
			type: "a",
			title: "System",
			label: (
				<>
					<Wrench />
					System
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
					Help
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
