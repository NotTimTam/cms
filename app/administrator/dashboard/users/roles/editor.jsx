"use client";

import Editor from "@/app/administrator/components/Editor";
import Loading from "@/app/administrator/components/Loading";
import Message from "@/app/administrator/components/Message";
import Tabs from "@/app/administrator/components/Tabs";
import { getToken } from "@/app/cookies";
import API from "@/util/API";
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

	const [role, setRole] = useState(id ? { _id: id } : defaultRole);

	// Functions
	const getRole = async () => {
		setMessage(null);

		setLoading(true);

		try {
			if (!role._id) return;

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

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const saveRole = async () => {
		setMessage(null);

		setLoading(true);

		try {
			const token = await getToken();

			const {
				data: { role: newRole },
			} = role._id
				? await API.patch(
						API.createRouteURL(API.roles, role._id),
						role,
						API.createAuthorizationConfig(token)
				  )
				: await API.post(
						API.createRouteURL(API.roles),
						role,
						API.createAuthorizationConfig(token)
				  );

			setRole(newRole);
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	useEffect(() => {
		if (id) getRole();
	}, [id]);

	if (loading) return <Loading />;

	return (
		<>
			<Editor
				{...{
					message,
					saveData: saveRole,
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
									value={role.name || ""}
									onChange={({ target: { value } }) =>
										setRole({ ...role, name: value })
									}
									type="text"
									id="name"
									placeholder="Article Editor, Website Manager, Etc."
								/>

								<label htmlFor="description">Description</label>
								<textarea
									value={role.description || ""}
									onChange={({ target: { value } }) =>
										setRole({ ...role, description: value })
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
