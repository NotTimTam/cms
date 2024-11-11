"use client";

import Editor from "@/app/administrator/components/Editor";
import Loading from "@/app/administrator/components/Loading";
import Message from "@/app/administrator/components/Message";
import Tabs from "@/app/administrator/components/Tabs";
import { getToken } from "@/app/cookies";
import API from "@/util/API";
import { FileInput, FilePlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const defaultGroup = {
	name: "",
	description: "",
};

const GroupEditor = ({ id }) => {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [userGroup, setUserGroup] = useState(id ? { _id: id } : defaultGroup);

	// Functions
	const getGroup = async () => {
		setMessage(null);

		setLoading(true);

		try {
			if (!userGroup._id) return;

			const token = await getToken();

			const {
				data: { userGroup: newUserGroup },
			} = await API.get(
				API.createRouteURL(API.userGroups, id),
				API.createAuthorizationConfig(token)
			);

			setUserGroup(newUserGroup);
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const saveGroup = async () => {
		setMessage(null);

		setLoading(true);

		let ret;

		try {
			const token = await getToken();

			const {
				data: { userGroup: newUserGroup },
			} = userGroup._id
				? await API.patch(
						API.createRouteURL(API.userGroups, userGroup._id),
						userGroup,
						API.createAuthorizationConfig(token)
				  )
				: await API.post(
						API.userGroups,
						userGroup,
						API.createAuthorizationConfig(token)
				  );

			setUserGroup(newUserGroup);

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
		if (!id) setUserGroup(defaultGroup);
		else getGroup();
	}, [id]);

	if (loading) return <Loading />;

	return (
		<>
			<Editor
				{...{
					message,
					saveData: saveGroup,
					saveOptions: [
						{
							label: (
								<>
									<FilePlus2 /> Save & New
								</>
							),
							ariaLabel: "Save & New",
							callback: async () => {
								const savedSuccessfully = await saveGroup();

								if (savedSuccessfully)
									router.push(
										"/administrator/dashboard/users?view=groups&layout=edit"
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
								const savedSuccessfully = await saveGroup();

								if (savedSuccessfully) {
									setLoading(true);
									setMessage(null);

									try {
										const token = await getToken();

										const {
											data: { userGroup: newUserGroup },
										} = await API.post(
											API.userGroups,
											{
												name: `Copy of ${
													userGroup.name
												} - ${new Date().toISOString()}`,
												description:
													userGroup.description,
											},
											API.createAuthorizationConfig(token)
										);

										router.push(
											`/administrator/dashboard/users?view=groups&layout=edit&id=${newUserGroup._id}`
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
						router.push(
							"/administrator/dashboard/users?view=groups"
						),
					tabs: [
						Tabs.Item(
							"Content",
							<form
								className="--cms-form"
								onSubmit={(e) => e.preventDefault()}
							>
								<label htmlFor="name" required>
									Name
								</label>
								<input
									value={userGroup.name || ""}
									onChange={({ target: { value } }) =>
										setUserGroup({
											...userGroup,
											name: value,
										})
									}
									type="text"
									id="name"
									placeholder="Editors, Administrators, Etc."
								/>

								<label htmlFor="description">Description</label>
								<textarea
									value={userGroup.description || ""}
									onChange={({ target: { value } }) =>
										setUserGroup({
											...userGroup,
											description: value,
										})
									}
									id="description"
									placeholder="What is the purpose of this group?"
								></textarea>
							</form>
						),
						Tabs.Item(
							<>User Roles</>,
							<>
								<Message type="info">
									The user roles assigned to a group determine
									the access level this user group will have
									around the site.
								</Message>
							</>
						),
					],
				}}
			/>
		</>
	);
};

export default GroupEditor;
