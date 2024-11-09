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

	/**
	 * Unpublished
	 * Published
	 * Trashed
	 * Archived
	 */

	// Functions
	const getRole = async () => {
		setMessage(null);

		setLoading(true);

		try {
			if (!article._id) return;

			const token = await getToken();

			const {
				data: { role: newRole },
			} = await API.get(
				API.createRouteURL(API.users, "roles", id),
				API.createAuthorizationConfig(token)
			);

			setRole(newRole);
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	// const saveRole = async () => {
	// 	setMessage(null);

	// 	setLoading(true);

	// 	try {
	// 		const token = await getToken();

	// 		console.log(article._id);

	// 		const {
	// 			data: { article: newArticle },
	// 		} = article._id
	// 			? await API.patch(
	// 					API.createRouteURL(API.articles, article._id),
	// 					article,
	// 					API.createAuthorizationConfig(token)
	// 			  )
	// 			: await API.post(
	// 					API.articles,
	// 					article,
	// 					API.createAuthorizationConfig(token)
	// 			  );

	// 		setArticle(newArticle);
	// 	} catch (error) {
	// 		console.error(error);

	// 		setMessage(<Message type="error">{error.data}</Message>);
	// 	}

	// 	setLoading(false);
	// };

	// useEffect(() => {
	// 	if (id) getRole();
	// }, [id]);

	if (loading) return <Loading />;

	return (
		<Editor
			{...{
				data: role,
				setData: setRole,
				// saveData: saveRole,
				closeEditor: () =>
					router.push("/administrator/dashboard/users?view=roles"),
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
						</form>
					),
				],
			}}
		/>
	);
};

export default RoleEditor;
