"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import Tabs from "../../components/Tabs";
import { capitalizeWords } from "@/util/display";
import Message from "../../components/Message";
import API from "@/util/API";
import { getToken } from "@/app/cookies";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import Editor from "../../components/Editor";

const defaultArticle = {
	status: "unpublished",
	featured: false,
	tags: [],
	category: undefined,
	notes: "",
	name: "",
	alias: "",
};

const ArticleEditor = ({ id }) => {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [article, setArticle] = useState(id ? { _id: id } : defaultArticle);

	/**
	 * Unpublished
	 * Published
	 * Trashed
	 * Archived
	 */

	// Functions
	const getArticle = async () => {
		setMessage(null);

		setLoading(true);

		try {
			if (!article._id) return;

			const token = await getToken();

			const {
				data: { article: newArticle },
			} = await API.get(
				API.createRouteURL(API.articles, id),
				API.createAuthorizationConfig(token)
			);

			setArticle(newArticle);
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

	const saveArticle = async () => {
		setLoading(true);
		setMessage(null);

		let ret;

		try {
			const token = await getToken();

			const {
				data: { article: newArticle },
			} = article._id
				? await API.patch(
						API.createRouteURL(API.articles, article._id),
						article,
						API.createAuthorizationConfig(token)
				  )
				: await API.post(
						API.articles,
						article,
						API.createAuthorizationConfig(token)
				  );

			setArticle(newArticle);

			ret = true;
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
		if (id) getArticle();
	}, [id]);

	if (loading) return <Loading />;

	return (
		<>
			<Editor
				{...{
					message,
					saveData: saveArticle,
					closeEditor: () =>
						router.push("/administrator/dashboard/articles"),
					tabs: [
						Tabs.Item(
							"Content",
							<>
								<Tabs.Item.Main>Editor Here</Tabs.Item.Main>
								<Tabs.Item.Aside>
									<form
										onSubmit={(e) => e.preventDefault()}
										className="--cms-form"
									>
										<label htmlFor="status">Status</label>
										<button id="status">
											{capitalizeWords(article.status) ||
												"Unpublished"}
											<ChevronDown />
										</button>
										<label htmlFor="category" required>
											Category
										</label>
										Coming Soon (dropdown)
										<label htmlFor="featured">
											Featured
										</label>
										Coming Soon (toggle)
										<label htmlFor="access">Access</label>
										Coming Soon (dropdown)
										<label htmlFor="tags">Tags</label>
										Coming Soon
										<label htmlFor="notes">Notes</label>
										<textarea
											id="notes"
											placeholder="Recent changes, help for other editors, etc..."
											aria-label="Notes"
											value={article.notes || ""}
											onChange={({ target: { value } }) =>
												setArticle((article) => ({
													...article,
													notes: value,
												}))
											}
										></textarea>
									</form>
								</Tabs.Item.Aside>
							</>,
							"Content"
						),
						Tabs.Item("Metadata", <>Metadata</>, "Metadata"),
						Tabs.Item("Options", <>Options</>, "Options"),
						Tabs.Item("Publishing", <>Publishing</>, "Publishing"),
						Tabs.Item(
							"Configure Front-End Editor",
							<>Configure Front-End Editor</>,
							"Configure Front-End Editor"
						),
						Tabs.Item(
							"Permissions",
							<>Permissions</>,
							"Permissions"
						),
					],
				}}
			>
				<Editor.ContentIdentifierForm
					data={article}
					setData={setArticle}
				/>
			</Editor>
		</>
	);
};

export default ArticleEditor;
