"use client";

import Form from "@/components/Form";
import Nav from "@/app/administrator/components/Nav";
import { listLimitOptions } from "@/util/data";
import {
	capitalizeWords,
	combineClassNames,
	depthIndicator,
} from "@/util/display";
import { useContext, useEffect, useState } from "react";
import styles from "./editor.module.scss";
import Editor from "@/app/administrator/components/Editor";
import { Power, X } from "lucide-react";
import Message from "@/app/administrator/components/Message";
import Loading from "@/app/administrator/components/Loading";
import { useRouter } from "next/navigation";
import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";
import { getToken } from "@/app/cookies";
import API from "@/util/API";
import useUserRoles from "@/app/administrator/hooks/useUserRoles";
import PermissionGroups from "@/app/administrator/components/Permissions";
import {
	ComponentPermissions,
	systemDefinitions,
	defaultDefinitions,
} from "@/util/permissions";

/**
 * Main Side Menu
 * System
 * - Global Configuration
 *  - Site
 *      - Site
 *          - Frontend Editing (Modules, Modules & Menus, None)
 *          - Default Editor (what editor is used when editing content)
 *          - Default Access Level (User Group)
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
			rateLimiter: { use: true, interval: 60000, requests: 5 },
		},
	},
	permissions: [],
	options: [],
};

export default function GlobalConfigurationEditor() {
	const router = useRouter();

	const userRoles = useUserRoles();

	const [active, setActive] = useState(0);
	const [formData, setFormData] = useState(defaultGlobalConfiguration);
	const [message, setMessage] = useState(null);
	const [loading, setLoading] = useState(false);

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
										{
											type: "group",
											name: "rateLimiter",
											legend: "Rate Limiter",
											elements: [
												{
													type: "toggle",
													name: "use",
													label: "Use Rate Limiter",
													rebootRequired: true,
												},
												{
													type: "number",
													name: "interval",
													label: "Request Memory Interval",
													placeholder: "60000",
													rebootRequired: true,
													required: true,
												},
												<p
													style={{
														color: "var(--background-color-6)",
													}}
												>
													How long the system will
													remember requests for.{" "}
													{"(in milliseconds)"}
												</p>,
												{
													type: "number",
													name: "requests",
													label: "Requests Per Interval",
													placeholder: "5",
													rebootRequired: true,
													required: true,
												},
												<p
													style={{
														color: "var(--background-color-6)",
													}}
												>
													How many requests can be
													made per interval.
												</p>,
												<Message>
													{formData.server.webServices
														.rateLimiter.interval &&
														formData.server
															.webServices
															.rateLimiter
															.requests && (
															<>
																Current setting:{" "}
																{
																	formData
																		.server
																		.webServices
																		.rateLimiter
																		.requests
																}{" "}
																request{"(s)"}{" "}
																every{" "}
																{(
																	formData
																		.server
																		.webServices
																		.rateLimiter
																		.interval /
																	1000 /
																	60
																).toFixed(
																	2
																)}{" "}
																minute{"(s)"}.
															</>
														)}
												</Message>,
											],
										},
										// RATELIMIT_INTERVAL
										// RATELIMIT_REQUESTS
										// RATELIMIT_INFO_IN_HEADERS
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
					form: userRoles && [
						<PermissionGroups
							userRoles={true}
							definitions={userRoles.map(
								(userRole) =>
									new ComponentPermissions(
										userRole._id,
										`${depthIndicator(
											userRole.depth,
											"\u2014"
										)} ${userRole.name}`,
										[
											...systemDefinitions,
											...defaultDefinitions,
										]
									)
							)}
							permissions={formData.permissions}
							setPermissions={(permissions) =>
								setFormData((formData) => ({
									...formData,
									permissions,
								}))
							}
						/>,
					],
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

	const requestShutdown = async () => {
		try {
			// make api request here.
			const token = await getToken();

			await API.get(
				API.createRouteURL(API.system, "shutdown"),
				API.createAuthorizationConfig(token)
			);
		} catch (error) {
			console.error(error);

			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);
		}
	};

	useEffect(() => {
		console.log(formData);
	}, [formData]);

	if (loading || !userRoles) return <Loading />;

	return (
		<>
			{message && (
				<div
					style={{
						paddingTop: "var(--padding)",
						paddingLeft: "var(--padding)",
						paddingRight: "var(--padding)",
					}}
				>
					{message}
				</div>
			)}
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
										<Power /> Save & Shutdown
									</>
								),
								ariaLabel: "Save & Shutdown",
								callback: async () => {
									const savedSuccessfully =
										await saveGlobalConfiguration(false);

									if (savedSuccessfully) {
										const PopupContent = () => {
											const closePopup =
												useContext(PopupContext);

											return (
												<div
													className={combineClassNames(
														"--cms-popup-content --cms-popup-content-centered",
														styles[
															"--cms-popup-form"
														]
													)}
												>
													<Message type="error" fill>
														Pressing {'"Shutdown"'}{" "}
														will make the server
														shut down. If your
														server's container is
														not configured to
														automatically reboot it,
														you will need to reboot
														it manually. You must
														also monitor the
														server's logs to ensure
														it boots up correctly.
													</Message>

													<div
														className={
															styles[
																"--cms-popup-form-buttons"
															]
														}
													>
														<button
															type="button"
															className="--cms-success"
															onClick={closePopup}
														>
															<X />
															Cancel
														</button>
														<button
															type="button"
															className="--cms-error"
															onClick={() => {
																closePopup();
																requestShutdown();
															}}
														>
															<Power />
															Shutdown
														</button>
													</div>
												</div>
											);
										};

										const res = await createHeadlessPopup(
											<PopupContent />
										);
									}
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
						className={styles["--cms-global-configuration-form"]}
						onSubmit={saveGlobalConfiguration}
						elements={currentMenu.form}
						{...{ formData, setFormData }}
					/>
				)}
			</div>
		</>
	);
}
