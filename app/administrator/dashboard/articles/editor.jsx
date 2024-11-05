"use client";

import {
	Accessibility,
	ChevronDown,
	CircleHelp,
	Eye,
	GitBranch,
	Save,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

import styles from "./page.module.scss";
import { aliasRegex, nameRegex } from "@/util/regex";
import Tabs from "../../components/Tabs";
import { capitalizeWords } from "@/util/display";
import Message from "../../components/Message";
import API from "@/util/API";
import { getToken } from "@/app/cookies";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../../components/Loading";

const defaultArticle = {
	status: "unpublished",
	featured: false,
	access: "public",
	tags: [],
	category: undefined,
	notes: "",
	name: "",
	alias: "",
};

const Editor = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [tab, setTab] = useState(0);
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

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const saveArticle = async () => {
		setMessage(null);

		setLoading(true);

		try {
			const token = await getToken();

			console.log(article._id);

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
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	useEffect(() => {
		if (id) getArticle();
	}, [id]);

	if (loading) return <Loading />;

	return (
		<>
			{message && (
				<div className={styles["--cms-message-container"]}>
					{message}
				</div>
			)}

			<nav className="--cms-nav">
				<section>
					<button
						className="--cms-success"
						aria-label="Save"
						onClick={saveArticle}
					>
						<Save /> Save
					</button>
					<span>
						<button
							className="--cms-success"
							aria-label="Save & Close"
						>
							<Save /> Save & Close
						</button>
						<button
							className="--cms-success"
							aria-label="More Save Options"
						>
							<ChevronDown />
						</button>
					</span>

					<button
						className="--cms-error"
						aria-label="Close"
						onClick={() =>
							router.push("/administrator/dashboard/articles")
						}
					>
						<X /> Close
					</button>
				</section>

				<section>
					<button
						disabled
						className="--cms-info"
						aria-label="Versions"
					>
						<GitBranch />
						Versions
					</button>

					<button
						disabled
						className="--cms-info"
						aria-label="Preview"
					>
						<Eye />
						Preview
					</button>

					<button
						disabled
						className="--cms-info"
						aria-label="Accessibility Check"
					>
						<Accessibility />
						Accessibility Check
					</button>

					<button disabled className="--cms-highlight">
						<CircleHelp /> Help
					</button>
				</section>
			</nav>
			<section className={styles["--cms-editor-content"]}>
				<form
					onSubmit={(e) => e.preventDefault()}
					className={`--cms-form ${styles["--cms-editor-title-form"]}`}
				>
					<section>
						<label htmlFor="name" required>
							Name
						</label>
						<input
							type="text"
							name="name"
							id="name"
							placeholder="My Article"
							autoComplete="off"
							value={article.name || ""}
							onChange={({ target: { value } }) =>
								setArticle((article) => ({
									...article,
									name: value,
								}))
							}
							pattern={nameRegex}
						/>
					</section>
					<section>
						<label htmlFor="alias" required>
							Alias
						</label>
						<input
							type="text"
							name="alias"
							id="alias"
							placeholder="my-article"
							autoComplete="off"
							value={article.alias || ""}
							onChange={({ target: { value } }) =>
								setArticle((article) => ({
									...article,
									alias: value,
								}))
							}
							pattern={aliasRegex}
						/>
					</section>
				</form>
				<div className={styles["--cms-editor-tabs"]}>
					<Tabs
						{...{
							currentItem: tab,
							setCurrentItem: setTab,
						}}
						items={[
							Tabs.Item(
								"Content",
								<>
									<aside
										className={
											styles["--cms-editor-side-menu"]
										}
									>
										<form
											onSubmit={(e) => e.preventDefault()}
											className="--cms-form"
										>
											<label htmlFor="status">
												Status
											</label>
											<button id="status">
												{capitalizeWords(
													article.status
												) || "Unpublished"}
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
											<label htmlFor="access">
												Access
											</label>
											Coming Soon (dropdown)
											<label htmlFor="tags">Tags</label>
											Coming Soon
											<label htmlFor="notes">Notes</label>
											<textarea
												id="notes"
												placeholder="Recent changes, help for other editors, etc..."
												aria-label="Notes"
												value={article.notes || ""}
												onChange={({
													target: { value },
												}) =>
													setArticle((article) => ({
														...article,
														notes: value,
													}))
												}
											></textarea>
										</form>
									</aside>
								</>,
								"Content"
							),
							Tabs.Item("Metadata", <>Metadata</>, "Metadata"),
							Tabs.Item("Options", <>Options</>, "Options"),
							Tabs.Item(
								"Publishing",
								<>Publishing</>,
								"Publishing"
							),
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
						]}
					/>
				</div>
			</section>
		</>
	);
};

export default Editor;
