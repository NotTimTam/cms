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
import { useEffect, useState } from "react";
import Select from "../../components/Select";

const defaultUser = {
	name: "",
	username: "",
	password: "",
	email: "",
	roles: [],
};

const UserEditor = ({ id }) => {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [userRoles, setUserRoles] = useState(null);
	const [user, setUser] = useState(id ? { _id: id } : defaultUser);
	const [tab, setTab] = useState(0);

	// Functions
	const getUserRoles = async () => {
		setMessage(null);
		setLoading(true);

		try {
			const token = await getToken();

			const {
				data: { userRoles },
			} = await API.get(
				`${API.createRouteURL(
					API.userRoles
				)}?itemsPerPage=all&sortDir=1&sortField=order`,
				API.createAuthorizationConfig(token)
			);

			setUserRoles(userRoles);
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const getRole = async () => {
		setMessage(null);

		setLoading(true);

		try {
			if (!user._id) return;

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

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const saveRole = async () => {
		setMessage(null);

		setLoading(true);

		let ret;

		try {
			const token = await getToken();

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

			setUser(newUser);

			ret = true;
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);

			ret = false;
		}

		setLoading(false);

		return ret;
	};

	useEffect(() => {
		if (!id) setUser(defaultRole);
		else getRole();
	}, [id]);

	useEffect(() => {
		getUserRoles();
	}, []);

	if (loading) return <Loading />;

	return (
		<>
			<Editor
				{...{
					tab,
					setTab,
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
								const savedSuccessfully = await saveRole();

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
								const savedSuccessfully = await saveRole();

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
									type="text"
									id="name"
									placeholder="Editors, Administrators, Etc."
								/>
							</form>
						),
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
		</>
	);
};

export default UserEditor;
