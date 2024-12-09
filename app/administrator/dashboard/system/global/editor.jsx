"use client";

import Form from "@/app/administrator/components/Form";
import Nav from "@/app/administrator/components/Nav";
import { useState } from "react";

/**
 * Main Side Menu
 * System
 * - Global Configuration
 *  - Site
 *      - Site
 *          - Site Name (required)
 *          - Site Offline
 *          - Frontend Editing (Modules, Modules & Menus, None)
 *          - Default Editor (what editor is used when editing content)
 *          - Default Access Level (User Group)
 *          - Default List Limit (100, probably pagination)
 *          - Default Feed Limit (10, (5-30 by 5, 50, 100))
 *      - Metadata
 *          - Site Meta Description
 *          - Robots [(index, follow), (noindex, follow), (index, nofollow), (noindex, nofollow)]
 *          - Content Rights (Text area, google it)
 *          - Author Meta Tag (show/hide)
 *          - CMS Version (show/hide)
 *  - System
 *      - Debug
 *          - Debug System (toggle) yes/no
 *          - Debug Language (toggle) yes/no
 *      - Cache (toggle) off/on
 *      - Session
 *          - Session Handler (Redis, Database, Filesystem, APC User Cache)
 *          - Session Lifetime (minutes) [480] number input
 *          - Shared Sessions (yes/no)
 *          - Track Session Metadata (yes/no)
 *          - Track Guest Session Metadata (yes/no)
 *  - Server
 *      - Server
 *          - Path to Temp Folder (relative to /temp, so the user cannot overwrite system files)
 *          - Error Reporting (System Default, None, Simple, Maximum)
 *          - Force HTTPS (none, administrator only, entire site)
 *      - Location
 *          - Website Time Zone
 *      - Web Services
 *          - Enable CORS
 *      - Proxy
 *          - Behind Load Balancer
 *          - Enable Outbound Proxy (necessary?)
 *  - Logging
 *      - Path to Log Folder
 *      - Log Almost Everything (Debug logs)
 *  - Permissions
 *      - This is a permission config that determines the options for users overall, not for components.
 *      - Site Login, Admin Login, Web Services Login, Offline Access, Super User, Configure Options, Access Administration INterface, Create, Delete, Edit, Edit State, Edit Own Edit Custom Field Value
 * Options (shows all display options for each component, these are global defaults which can be overwritten in each item)
 *  (each item also has permissions to determine default permissions for editing this specific component)
 * - Articles
 * - Cache
 * - Check-in
 * - Media
 * - Menus
 * - Modules
 * - Tags
 * - Users
 * - also all extensions ones like Contacts and Events Booking, sorted alphabetically.
 */

const menus = [
	{
		label: "System",
		menu: [
			{
				label: "Site",

				// Site, Metadata
				form: [
					{
						type: "group",
						name: "site",
						elements: [
							{
								type: "text",
								name: "siteName",
								placeholder: "My Website",
								label: "Site Name",
								required: true,
							},
						],
					},
					{
						type: "group",
						name: "metadata",
						elements: [],
					},
				],
			},
			{
				label: "System",
			},
			{
				label: "Server",
			},
			{
				label: "Logging",
			},
			{
				label: "Permissions",
			},
		],
	},
	{
		label: "Options",
		menu: [
			{
				label: "Articles",
			},
			{
				label: "Cache",
			},
			{
				label: "Check-in",
			},
			{
				label: "Media",
			},
			{
				label: "Menus",
			},
			{
				label: "Modules",
			},
			{
				label: "Tags",
			},
			{
				label: "Users",
			},
			/**
			 * - Articles
			 * - Cache
			 * - Check-in
			 * - Media
			 * - Menus
			 * - Modules
			 * - Tags
			 * - Users
			 * - also all extensions ones like Contacts and Events Booking, sorted alphabetically.
			 */
		],
	},
];

export default function GlobalConfigurationEditor() {
	const [active, setActive] = useState(0);

	const [formData, setFormData] = useState({});

	const currentMenu = menus.map(({ menu }) => menu).flat()[active];

	const handleSubmit = async () => {
		try {
			console.log("Form submitted.");
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div>
			<aside>
				{menus.map(({ label, menu }, index) => {
					const baseIndex = menus
						.filter((_, pIndex) => pIndex < index)
						.map(({ menu }) => menu.length)
						.reduce((a, b) => a + b, 0);

					return (
						<section key={index}>
							<header>
								<h3>{label}</h3>
							</header>
							<Nav
								items={menu.map(({ label }) => label)}
								active={active - baseIndex}
								setActive={(newIndex) =>
									setActive(baseIndex + newIndex)
								}
							/>
						</section>
					);
				})}
			</aside>
			{currentMenu && currentMenu.form && (
				<Form
					onSubmit={handleSubmit}
					elements={currentMenu.form}
					{...{ formData, setFormData }}
				/>
			)}
		</div>
	);
}
