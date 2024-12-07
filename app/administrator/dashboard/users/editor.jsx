"use client";

import Editor from "@/app/administrator/components/Editor";
import Loading from "@/app/administrator/components/Loading";
import Message from "@/app/administrator/components/Message";
import Tabs from "@/app/administrator/components/Tabs";
import { getToken } from "@/app/cookies";
import API from "@/util/API";
import { FileInput, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Select from "../../components/Select";
import { nameRegex } from "@/util/regex";
import { AuthenticatedUserContext } from "@/components/AuthenticatedUserContext";
import PermissionGroups from "../../components/Permissions";
import { componentPermissions, systemPermissions } from "@/util/permissions";

const defaultUser = {
	name: "",
	username: "",
	password: "",
	roles: [],
	permissionGroups: [],
};

const UserEditor = ({ id }) => {
	const currentUser = useContext(AuthenticatedUserContext);
	const me = id && currentUser._id === id;

	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [roles, setRoles] = useState(null);
	const [user, setUser] = useState(id ? { _id: id } : defaultUser);
	const [tab, setTab] = useState(0);

	// Functions
	const getRoles = async () => {
		if (!currentUser.verified) return;

		setMessage(null);

		try {
			const token = await getToken();

			const {
				data: { roles },
			} = await API.get(
				`${API.createRouteURL(
					API.roles,
					"tree"
				)}?itemsPerPage=all&sortDir=1&sortField=order`,
				API.createAuthorizationConfig(token)
			);

			setRoles(roles);
		} catch (error) {
			console.error(error);

			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);
		}
	};

	const getUser = async () => {
		if (!id) return;

		setMessage(null);

		setLoading(true);

		try {
			const token = await getToken();

			const {
				data: { user: newUser },
			} = await API.get(
				API.createRouteURL(API.users, id),
				API.createAuthorizationConfig(token)
			);

			setUser(newUser);
		} catch (error) {
			console.error(error);

			if (error.status === 404) router.push("/not-found");

			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);
		}

		setLoading(false);
	};

	const saveUser = async (isolated = true) => {
		setMessage(null);

		setLoading(true);

		let ret;

		try {
			const token = await getToken();

			// If the user is trying to change their password.
			if (user.password) {
				if (
					!user.repeatPassword ||
					user.repeatPassword !== user.password
				)
					throw { data: "Passwords must match." };

				delete user.repeatPassword;
			}

			const {
				data: { user: newUser },
			} = user._id
				? await API.patch(
						API.createRouteURL(API.users, user._id),
						user,
						API.createAuthorizationConfig(token)
				  )
				: await API.post(
						API.users,
						user,
						API.createAuthorizationConfig(token)
				  );

			if (!id && isolated)
				router.push(
					`/administrator/dashboard/users?layout=edit&id=${newUser._id}`
				);
			else {
				setUser(newUser);

				ret = true;
			}
		} catch (error) {
			console.error(error);

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
		if (!currentUser.verified && !me)
			router.push(
				`/administrator/dashboard/users?layout=edit&id=${currentUser._id}`
			);

		if (!id) setUser(defaultUser);
		else getUser();
	}, [id]);

	useEffect(() => {
		getRoles();
	}, []);

	if (loading) return <Loading />;

	return (
		<Editor
			{...{
				tab,
				setTab,
				message,
				saveData: saveUser,
				saveOptions: [
					{
						label: (
							<>
								<FilePlus2 /> Save & New
							</>
						),
						ariaLabel: "Save & New",
						callback: async () => {
							const savedSuccessfully = await saveUser(false);

							if (savedSuccessfully)
								router.push(
									"/administrator/dashboard/users?layout=edit"
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
							const savedSuccessfully = await saveUser(false);

							if (savedSuccessfully) {
								setLoading(true);
								setMessage(null);

								try {
									const token = await getToken();

									const {
										data: { user: newUser },
									} = await API.post(
										API.users,
										{
											name: `Copy of ${
												user.name
											} - ${new Date().toISOString()}`,
											description: user.description,
										},
										API.createAuthorizationConfig(token)
									);

									router.push(
										`/administrator/dashboard/users?layout=edit&id=${newUser._id}`
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
					router.push("/administrator/dashboard/users"),
				tabs: [
					Tabs.Item(
						"Info",
						<form
							className="--cms-form"
							onSubmit={(e) => e.preventDefault()}
						>
							<label htmlFor="name" required>
								Name
							</label>
							<input
								value={user.name || ""}
								onChange={({ target: { value } }) =>
									setUser({
										...user,
										name: value,
									})
								}
								autoComplete="off"
								type="text"
								id="name"
								placeholder="Editors, Administrators, Etc."
								required
								pattern={nameRegex}
							/>

							<label htmlFor="username" required>
								Username
							</label>
							<input
								value={user.username || ""}
								onChange={({ target: { value } }) =>
									setUser({
										...user,
										username: value,
									})
								}
								type="text"
								id="username"
								autoComplete="username"
								placeholder="myusername123"
								required
								pattern={nameRegex}
							/>

							<label htmlFor="email">Email Address</label>
							<input
								value={user.email || ""}
								onChange={({ target: { value } }) =>
									setUser({
										...user,
										email: value,
									})
								}
								type="email"
								id="email"
								autoComplete="email"
								placeholder="john.doe@provider.com"
							/>

							<label htmlFor="password" required={!user._id}>
								Password
							</label>
							<input
								required={!user._id}
								value={user.password || ""}
								onChange={({ target: { value } }) =>
									setUser({
										...user,
										password: value,
									})
								}
								type="password"
								id="password"
								autoComplete="new-password"
							/>

							<label
								htmlFor="repeat-password"
								required={!user._id}
							>
								Repeat Password
							</label>
							<input
								required={!user._id}
								value={user.repeatPassword || ""}
								onChange={({ target: { value } }) =>
									setUser({
										...user,
										repeatPassword: value,
									})
								}
								type="password"
								id="repeat-password"
								autoComplete="new-password"
							/>

							{me && !user.verified && (
								<Message type="info" fill>
									<p>
										Enter a new password into the{" "}
										{'"Password"'} and
										{' "Repeat Password"'} inputs and hit{" "}
										{'"Save"'} to verify yourself. You will
										be prompted to log back in with your new
										credentials.
									</p>
								</Message>
							)}

							{user._id && !me && (
								<>
									<label>Verification Status</label>
									{user.verified ? (
										<Message type="success" fill>
											<p>This user has been verified.</p>
										</Message>
									) : (
										<Message type="warning" fill>
											<p>
												This user has not been verified.
												A user must log in and change
												their password once to verify
												themselves. An unverified user
												cannot access any other portions
												of the administrative dashboard
												until they have verified
												themselves.
											</p>
										</Message>
									)}
								</>
							)}
						</form>
					),
					roles &&
						Tabs.Item(
							<>
								User Roles
								{user.roles &&
									user.roles.length > 0 &&
									` (${user.roles.length})`}
							</>,
							<div className="--cms-padding">
								{roles &&
									(roles.length > 0 ? (
										<Select
											{...{
												items: roles,
												selection: user.roles,
												setSelection: (selection) =>
													setUser((user) => ({
														...user,
														roles: selection,
													})),
											}}
										/>
									) : (
										<Message type="info" fill>
											<p>
												No roles have been defined.{" "}
												<Link href="/administrator/dashboard/users?view=roles">
													Create a role.
												</Link>
											</p>
										</Message>
									))}
							</div>
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
									permissions={user.permissionGroups}
									setPermissions={(value) =>
										setUser((user) => ({
											...user,
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

export default UserEditor;
