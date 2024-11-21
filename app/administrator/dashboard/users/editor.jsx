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

const defaultUser = {
	name: "",
	username: "",
	password: "",
	roles: [],
};

const UserEditor = ({ id }) => {
	const currentUser = useContext(AuthenticatedUserContext);
	const me = id && currentUser._id === id;

	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [userRoles, setUserRoles] = useState(null);
	const [user, setUser] = useState(id ? { _id: id } : defaultUser);
	const [tab, setTab] = useState(0);

	// Functions
	const getUserRoles = async () => {
		if (!currentUser.verified) return;

		setMessage(null);

		try {
			const token = await getToken();

			const {
				data: { userRoles },
			} = await API.get(
				`${API.createRouteURL(
					API.userRoles,
					"tree"
				)}?itemsPerPage=all&sortDir=1&sortField=order`,
				API.createAuthorizationConfig(token)
			);

			setUserRoles(userRoles);
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);
		}
	};

	const getUser = async () => {
		if (!id) return;

		setMessage(null);

		setLoading(true);

		try {
			const token = await getToken();

			console.log(id);

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

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const saveUser = async (isolated = true) => {
		console.log("SAVE USER CALLED");

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

			setMessage(<Message type="error">{error.data}</Message>);

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
		getUserRoles();
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
											{error.data}
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

							<label htmlFor="password">Password</label>
							<input
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

							<label htmlFor="repeat-password">
								Repeat Password
							</label>
							<input
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
									Enter a new password into the {'"Password"'}{" "}
									and
									{' "Repeat Password"'} inputs and hit{" "}
									{'"Save"'} to verify yourself. You will be
									prompted to log back in with your new
									credentials.
								</Message>
							)}

							{user._id && !me && (
								<>
									<label>Verification Status</label>
									{user.verified ? (
										<Message type="success" fill>
											This user has been verified.
										</Message>
									) : (
										<Message type="warning" fill>
											This user has not been verified. A
											user must log in and change their
											password once to verify themselves.
											An unverified user cannot access any
											other portions of the administrative
											dashboard until they have verified
											themselves.
										</Message>
									)}
								</>
							)}
						</form>
					),
					userRoles &&
						Tabs.Item(
							<>
								User Roles
								{user.roles &&
									user.roles.length > 0 &&
									` (${user.roles.length})`}
							</>,
							<div className="--cms-padding">
								{userRoles &&
									(userRoles.length > 0 ? (
										<Select
											{...{
												items: userRoles,
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
											No user roles have been defined.{" "}
											<Link href="/administrator/dashboard/users?view=roles">
												Create a user role.
											</Link>
										</Message>
									))}
							</div>
						),
				],
			}}
		/>
	);
};

export default UserEditor;
