"use client";

import {
	BadgeInfo,
	Blocks,
	FileCode2,
	FileText,
	FolderClosed,
	Home,
	Menu,
	Users,
	Wrench,
} from "lucide-react";
import { createContext, useState } from "react";

const menu = [
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
		href: "/administrator/dashboard/menus",
	},

	{
		type: "s",
		title: "Extensions",
		label: (
			<>
				<Blocks />
				<span>Extensions</span>
			</>
		),
		href: "/administrator/dashboard/extensions",
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
		href: "/administrator/dashboard/users",
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
				<BadgeInfo />
				<span>Help</span>
			</>
		),
		href: "/administrator/dashboard/help",
	},
];

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
			value={{ menu, state: [administrator, setAdministrator] }}
		>
			{children}
		</AdministratorContext.Provider>
	);
}
