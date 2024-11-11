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

const defaultRole = {
	name: "",
	description: "",
};

const RoleEditor = ({ id }) => {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [userRole, setUserRole] = useState(id ? { _id: id } : defaultRole);

	// Functions
	const getRole = async () => {
		setMessage(null);

		setLoading(true);

		try {
			if (!userRole._id) return;

			const token = await getToken();

			const {
				data: { userRole: newUserRole },
			} = await API.get(
				API.createRouteURL(API.userRoles, id),
				API.createAuthorizationConfig(token)
			);

			setUserRole(newUserRole);
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
				data: { userRole: newUserRole },
			} = userRole._id
				? await API.patch(
						API.createRouteURL(API.userRoles, userRole._id),
						userRole,
						API.createAuthorizationConfig(token)
				  )
				: await API.post(
						API.createRouteURL(API.userRoles),
						userRole,
						API.createAuthorizationConfig(token)
				  );

			setUserRole(newUserRole);

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
		if (!id) setUserRole(defaultRole);
		else getRole();
	}, [id]);

	if (loading) return <Loading />;

	return (
		<>
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
								const savedSuccessfully = await saveRole();

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
						},
					],
					closeEditor: () =>
						router.push(
							"/administrator/dashboard/users?view=roles"
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
									value={userRole.name || ""}
									onChange={({ target: { value } }) =>
										setUserRole({
											...userRole,
											name: value,
										})
									}
									type="text"
									id="name"
									placeholder="Article Editor, Website Manager, Etc."
								/>

								<label htmlFor="description">Description</label>
								<textarea
									value={userRole.description || ""}
									onChange={({ target: { value } }) =>
										setUserRole({
											...userRole,
											description: value,
										})
									}
									id="description"
									placeholder="What is the purpose of this role?"
								></textarea>
							</form>
						),
					],
				}}
			/>
		</>
	);
};

export default RoleEditor;
