"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import Tabs from "../../components/Tabs";
import { capitalizeWords, depthIndicator } from "@/util/display";
import Message from "../../components/Message";
import API from "@/util/API";
import { getToken } from "@/app/cookies";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import Editor from "../../components/Editor";

const defaultTag = {
	name: "",
	alias: "",
};

const TagEditor = ({ id }) => {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [tag, setTag] = useState(id ? { _id: id } : defaultTag);
	const [possibleParents, setPossibleParents] = useState(null);

	// Functions
	const getTag = async () => {
		if (!id) return;

		setMessage(null);

		setLoading(true);

		try {
			const token = await getToken();

			const {
				data: { tag: newTag },
			} = await API.get(
				API.createRouteURL(API.tags, id),
				API.createAuthorizationConfig(token)
			);

			setTag(newTag);
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
				data: { tags: possibleParents },
			} = await API.get(
				`${API.createRouteURL(API.tags, "parents", id || "all")}`,
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

	const saveTag = async (isolated = true) => {
		setLoading(true);
		setMessage(null);

		let ret;

		try {
			const token = await getToken();

			const {
				data: { tag: newTag },
			} = tag._id
				? await API.patch(
						API.createRouteURL(API.tags, tag._id),
						tag,
						API.createAuthorizationConfig(token)
				  )
				: await API.post(
						API.tags,
						tag,
						API.createAuthorizationConfig(token)
				  );

			if (!id && isolated)
				router.push(
					`/administrator/dashboard/tags?layout=edit&id=${newTag._id}`
				);
			else {
				setTag(newTag);

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
		if (!id) setTag(defaultTag);
		else getTag();

		getPossibleParents();
	}, [id]);
	if (loading) return <Loading />;

	return (
		<Editor
			{...{
				message,
				saveData: saveTag,
				closeEditor: () => router.push("/administrator/dashboard/tags"),
				tabs: [
					Tabs.Item(
						"Tag",
						<form
							onSubmit={(e) => e.preventDefault()}
							className="--cms-form"
						>
							{possibleParents ? (
								<>
									<label htmlFor="parent">Parent</label>
									<select
										id="parent"
										value={
											tag.parent === null
												? ""
												: tag.parent
										}
										onChange={(e) =>
											setTag((tag) => ({
												...tag,
												parent: e.target.value,
											}))
										}
									>
										<option value="">{"No Parent"}</option>
										{possibleParents.map(
											({ name, depth, _id }) => (
												<option key={_id} value={_id}>
													{depthIndicator(depth)}{" "}
													{name}
												</option>
											)
										)}
									</select>
								</>
							) : (
								<div className="--cms-padding">
									<Loading />
								</div>
							)}
							<label htmlFor="status">Status</label>
							<button id="status">
								{capitalizeWords(tag.status) || "Unpublished"}
								<ChevronDown />
							</button>
							{/* <label htmlFor="access">Access</label>
										Coming Soon (dropdown) */}
						</form>,
						"Content"
					),
					Tabs.Item(
						"Publishing",
						<>
							In publishing: created date, created by, modified
							date (readonly), modified by (readonly), id
							(readonly). In metadata: author
						</>,
						"Publishing"
					),
					Tabs.Item("Permissions", <>Permissions</>, "Permissions"),
				],
			}}
		>
			<Editor.ContentIdentifierForm
				data={tag}
				setData={setTag}
				namePlaceholder="My Tag"
				aliasPlaceholder="my-tag"
			/>
		</Editor>
	);
};

export default TagEditor;
