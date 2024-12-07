"use client";

import Editor from "@/app/administrator/components/Editor";
import Loading from "@/app/administrator/components/Loading";
import Message from "@/app/administrator/components/Message";
import Tabs from "@/app/administrator/components/Tabs";
import { getToken } from "@/app/cookies";
import API from "@/util/API";
import { depthIndicator } from "@/util/display";
import { FileInput, FilePlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { componentPermissions, systemPermissions } from "@/util/permissions";
import PermissionGroups from "@/app/administrator/components/Permissions";

const defaultRole = {
	name: "",
	description: "",
	parent: "",
	permissionGroups: [],
};

const RoleEditor = ({ id }) => {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [role, setRole] = useState(id ? { _id: id } : defaultRole);
	const [possibleParents, setPossibleParents] = useState(null);

	// Functions
	const getRole = async () => {
		setMessage(null);

		setLoading(true);

		try {
			if (!id) return;

			const token = await getToken();

			const {
				data: { role: newRole },
			} = await API.get(
				API.createRouteURL(API.roles, id),
				API.createAuthorizationConfig(token)
			);

			setRole(newRole);
		} catch (error) {
			console.error(error);

			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);
		}

		setLoading(false);
	};

	const getPossibleParents = async () => {
		setMessage(null);
		setLoading(true);

		try {
			const token = await getToken();

			const {
				data: { roles: possibleParents },
			} = await API.get(
				`${API.createRouteURL(API.roles, "parents", id || "all")}`,
				API.createAuthorizationConfig(token)
			);

			setPossibleParents(possibleParents);
		} catch (error) {
			console.error(error);

			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);
		}

		setLoading(false);
	};

	const saveRole = async (isolated = true) => {
		setMessage(null);

		setLoading(true);

		let ret;

		try {
			const token = await getToken();

			// The empty string used to signify "no selection" must be removed.
			const submittableRole = {
				...role,
				parent: role.parent === "" ? null : role.parent,
			};

			const {
				data: { role: newRole },
			} = role._id
				? await API.patch(
						API.createRouteURL(API.roles, role._id),
						submittableRole,
						API.createAuthorizationConfig(token)
				  )
				: await API.post(
						API.roles,
						submittableRole,
						API.createAuthorizationConfig(token)
				  );

			if (!id && isolated)
				router.push(
					`/administrator/dashboard/users?view=roles&layout=edit&id=${newRole._id}`
				);
			else {
				setRole(newRole);

				ret = true;
			}
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
		if (!id) setRole(defaultRole);
		else getRole();

		getPossibleParents();
	}, [id]);

	useEffect(() => {
		console.log(role);
	}, [role]);

	if (loading) return <Loading />;

	return (
		<Editor
			{...{
				message,
				saveData: saveRole,
				saveOptions: [
					{
						label: (
							<>
								<FilePlus2 /> Save & New
							</>
						),
						ariaLabel: "Save & New",
						callback: async () => {
							const savedSuccessfully = await saveRole(false);

							if (savedSuccessfully)
								router.push(
									"/administrator/dashboard/users?view=roles&layout=edit"
								);
						},
					},
					{
						label: (
							<>
								<FileInput /> Save & Copy
							</>
						),
						ariaLabel: "Save & Copy",
						callback: async () => {
							const savedSuccessfully = await saveRole(false);

							if (savedSuccessfully) {
								setLoading(true);
								setMessage(null);

								try {
									const token = await getToken();

									const {
										data: { role: newRole },
									} = await API.post(
										API.roles,
										{
											name: `Copy of ${
												role.name
											} - ${new Date().toISOString()}`,
											description: role.description,
											parent: role.parent,
										},
										API.createAuthorizationConfig(token)
									);

									router.push(
										`/administrator/dashboard/users?view=roles&layout=edit&id=${newRole._id}`
									);
								} catch (error) {
									setMessage(
										<Message type="error">
											<p>{error.data}</p>
										</Message>
									);
								}
							}

							setLoading(false);
						},
					},
				],
				closeEditor: () =>
					router.push("/administrator/dashboard/users?view=roles"),
				tabs: [
					Tabs.Item(
						"Content",
						<>
							<Tabs.Item.Main>
								<form
									className="--cms-form"
									onSubmit={(e) => e.preventDefault()}
								>
									<label htmlFor="name" required>
										Name
									</label>
									<input
										value={role.name || ""}
										onChange={({ target: { value } }) =>
											setRole({
												...role,
												name: value,
											})
										}
										type="text"
										id="name"
										placeholder="Article Editor, Website Manager, Etc."
									/>

									<label htmlFor="description">
										Description
									</label>
									<textarea
										value={role.description || ""}
										onChange={({ target: { value } }) =>
											setRole({
												...role,
												description: value,
											})
										}
										id="description"
										placeholder="What is the purpose of this role?"
									></textarea>
								</form>
							</Tabs.Item.Main>
							<Tabs.Item.Aside>
								{possibleParents ? (
									<form
										className="--cms-form"
										onSubmit={(e) => e.preventDefault()}
									>
										<label htmlFor="parent">Parent</label>
										<select
											id="parent"
											value={
												role.parent === null
													? ""
													: role.parent
											}
											onChange={(e) =>
												setRole((role) => ({
													...role,
													parent: e.target.value,
												}))
											}
										>
											<option value="">
												{"No Parent"}
											</option>
											{possibleParents.map(
												({ name, depth, _id }) => (
													<option
														key={_id}
														value={_id}
													>
														{depthIndicator(depth)}{" "}
														{name}
													</option>
												)
											)}
										</select>
									</form>
								) : (
									<div className="--cms-padding">
										<Loading />
									</div>
								)}
							</Tabs.Item.Aside>
						</>
					),
					Tabs.Item(
						"Permissions",
						<>
							<Message
								type="info"
								style={{
									margin: "var(--margin) var(--margin) 0 var(--margin)",
								}}
							>
								<p>
									Changes apply to this role and all child
									roles.
								</p>
								<ul>
									<li>
										<b>Inherited</b> &ndash; a Global
										Configuration setting or higher level
										setting is applied.
									</li>
									<li>
										<b>Denied</b> always wins &ndash;
										whatever is set at the Global or higher
										level is ignored and this selection
										cascades to all child elements.
									</li>
									<li>
										<b>Allowed</b> will enable the action
										for this component unless overruled by a
										Global Configuration setting.
									</li>
								</ul>
							</Message>
							<form
								className="--cms-form"
								style={{
									width: "max-content",
									maxWidth: "unset",
								}}
								onSubmit={(e) => e.preventDefault()}
							>
								<PermissionGroups
									definitions={[
										...systemPermissions,
										...componentPermissions,
									]}
									permissions={role.permissionGroups}
									setPermissions={(value) =>
										setRole((role) => ({
											...role,
											permissionGroups: value,
										}))
									}
								/>
							</form>
						</>
					),
				],
			}}
		/>
	);
};

export default RoleEditor;
