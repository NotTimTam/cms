"use client";

import Form from "@/components/Form";
import Nav from "@/app/administrator/components/Nav";
import { listLimitOptions } from "@/util/data";
import { capitalizeWords } from "@/util/display";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import Editor from "@/app/administrator/components/Editor";
import { Power } from "lucide-react";

/**
 * Main Side Menu
 * System
 * - Global Configuration
 *  - Site
 *      - Site
 *          - Frontend Editing (Modules, Modules & Menus, None)
 *          - Default Editor (what editor is used when editing content)
 *          - Default Access Level (User Group)
 *      - Metadata
 *          - Content Rights (Text area, google it)
 *  - System
 *      - Debug
 *          - Debug Language (toggle) yes/no
 *      - Session
 *          - Session Handler (Redis, Database, Filesystem, APC User Cache)
 *          - Session Lifetime (minutes) [480] number input
 *          - Shared Sessions (yes/no)
 *          - Track Session Metadata (yes/no)
 *          - Track Guest Session Metadata (yes/no)
 *  - Server
 *      - Server
 *          - Error Reporting (System Default, None, Simple, Maximum)
 *          - Force HTTPS (none, administrator only, entire site)
 *      - Location
 *          - Website Time Zone
 *      - Proxy
 *          - Behind Load Balancer
 *          - Enable Outbound Proxy (necessary?)
 *  - Permissions
 *      - This is a permission config that determines the options for users overall, not for components.
 * FOR EACH USER GROUP:
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

const defaultGlobalConfiguration = {
	site: {
		name: "Untitled Website",
		defaultListLimit: 20,
		defaultFeedLimit: 10,
		metadata: {
			robots: "noindex, nofollow",
			showCMSVersion: true,
			showAuthorMetaTag: true,
		},
	},
	server: {
		cache: {
			use: true,
			path: "/cache",
		},
		temp: "/tmp",
		webServices: {
			cors: true,
		},
	},
	permissions: {},
};

export default function GlobalConfigurationEditor() {
	const [active, setActive] = useState(0);

	const [formData, setFormData] = useState(defaultGlobalConfiguration);

	const menus = [
		{
			label: "System",
			menu: [
				{
					label: "Site",
					form: [
						{
							type: "group",
							name: "site",
							legend: "Site",
							elements: [
								{
									type: "text",
									name: "name",
									placeholder: "My Website",
									label: "Site Name",
									required: true,
								},
								{
									type: "toggle",
									name: "offline",
									label: "Site Offline",
								},
								{
									type: "select",
									name: "defaultListLimit",
									required: true,
									label: "Default List Limit",
									placeholder:
										"Select a default list limit...",
									options: listLimitOptions.map(
										(listLimit) => ({
											id: listLimit,
											label:
												typeof listLimit === "string"
													? capitalizeWords(listLimit)
													: listLimit,
										})
									),
								},
								{
									type: "select",
									name: "defaultFeedLimit",
									required: true,
									label: "Default Feed Limit",
									placeholder:
										"Select a default feed limit...",
									options: [
										5, 10, 15, 20, 25, 30, 50, 100,
									].map((feedLimit) => ({
										id: feedLimit,
										label: feedLimit,
									})),
								},
							],
						},
						{
							type: "group",
							name: "site",
							elements: [
								{
									type: "group",
									name: "metadata",
									legend: "Metadata",
									elements: [
										{
											type: "text",
											name: "author",
											label: "Author",
											placeholder: "John Doe",
										},
										{
											type: "toggle",
											name: "showAuthorMetaTag",
											label: "Show Author Meta Tag",
										},
										{
											type: "textarea",
											name: "description",
											label: "Description",
											placeholder:
												"What is the purpose of this site...",
										},
										{
											type: "textarea",
											name: "keywords",
											label: "Keywords",
											placeholder:
												"Genre, Keyword, Topic",
										},
										{
											type: "select",
											name: "robots",
											label: "Robots",
											placeholder:
												"Select a configuration...",
											options: [
												{
													id: "index, follow",
													label: "index, follow",
												},
												{
													id: "noindex, follow",
													label: "noindex, follow",
												},
												{
													id: "index, nofollow",
													label: "index, nofollow",
												},
												{
													id: "noindex, nofollow",
													label: "noindex, nofollow",
												},
											],
										},
										{
											type: "toggle",
											name: "showCMSVersion",
											label: "Show CMS Version",
										},
									],
								},
							],
						},
					],
				},
				{
					label: "Server",
					form: [
						{
							type: "group",
							name: "server",
							legend: "Server",
							elements: [
								{
									type: "text",
									name: "temp",
									label: "Path to Temp Folder",
									placeholder: "/tmp",
									required: true,
								},
								<p
									style={{
										color: "var(--background-color-6)",
									}}
								>
									{"<root>/files"}
									{formData.server.temp}
								</p>,
							],
						},

						{
							type: "group",
							name: "server",
							elements: [
								{
									type: "group",
									name: "cache",
									legend: "Cache",
									elements: [
										{
											type: "toggle",
											name: "use",
											label: "Use Cache System",
										},
										{
											type: "text",
											name: "path",
											label: "Path to Cache Folder",
											placeholder: "/cache",
											required: true,
										},
										<p
											style={{
												color: "var(--background-color-6)",
											}}
										>
											{"<root>/files"}
											{formData.server.cache.path}
										</p>,
									],
								},
								{
									type: "group",
									name: "webServices",
									legend: "Web Services",
									elements: [
										{
											type: "toggle",
											name: "cors",
											label: "Enable CORS",
											rebootRequired: true,
										},
									],
								},
							],
						},
						<p>
							<span style={{ color: "var(--info-color)" }}>
								{"*"}
							</span>{" "}
							Requires a server reboot for changes to take effect.
						</p>,
					],
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

	const currentMenu = menus.map(({ menu }) => menu).flat()[active];

	const saveGlobalConfiguration = async (isolated = true) => {
		setMessage(null);

		setLoading(true);

		let ret;

		try {
			console.log("save global config");
			ret = true; // remove

			// const token = await getToken();

			// // The empty string used to signify "no selection" must be removed.
			// const submittableRole = {
			// 	...role,
			// 	parent: role.parent === "" ? null : role.parent,
			// };

			// const {
			// 	data: { role: newRole },
			// } = role._id
			// 	? await API.patch(
			// 			API.createRouteURL(API.roles, role._id),
			// 			submittableRole,
			// 			API.createAuthorizationConfig(token)
			// 	  )
			// 	: await API.post(
			// 			API.roles,
			// 			submittableRole,
			// 			API.createAuthorizationConfig(token)
			// 	  );

			// if (!id && isolated)
			// 	router.push(
			// 		`/administrator/dashboard/users?view=roles&layout=edit&id=${newRole._id}`
			// 	);
			// else {
			// 	setRole(newRole);

			// 	ret = true;
			// }
		} catch (error) {
			console.error(error);

			if (error.status === 404) router.push("/not-found");

			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);

			ret = false;
		}

		setLoading(false);

		return ret;
	};

	useEffect(() => {
		console.log(formData);
	}, [formData]);

	return (
		<div className={styles["--cms-global-configuration-editor"]}>
			<Editor.Header
				className={styles["--cms-global-configuration-header"]}
				{...{
					saveData: () => {},
					closeEditor: () => {},

					versionsHref: "",
					previewHref: "",
					accessiblityCheckHref: "",
					helpHref: "",

					saveOptions: [
						{
							label: (
								<>
									<Power /> Save & Reboot
								</>
							),
							ariaLabel: "Save & Reboot",
							callback: async () => {
								const savedSuccessfully =
									await saveGlobalConfiguration(false);

								throw new Error(
									"No logic to handle rebooting."
								);
							},
						},
					],
				}}
			/>
			<aside className={styles["--cms-global-configuration-menus"]}>
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
					onSubmit={saveGlobalConfiguration}
					elements={currentMenu.form}
					{...{ formData, setFormData }}
				/>
			)}
		</div>
	);
}
