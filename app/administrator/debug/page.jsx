"use client";

import API from "@/util/api";
import { useEffect, useState } from "react";

const CreateArticleForm = () => {
	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();

				try {
					const {
						name: { value: name },
						alias: { value: alias },
						content: { value: content },
					} = e.target;

					const res = await API.post(`/api/articles`, {
						name,
						alias,
						content,
					});

					console.log(res.data);
				} catch (err) {
					console.error(err);
				}
			}}
		>
			<h2>Create Article</h2>

			<label htmlFor="name">Name</label>
			<input type="text" name="name" id="name" />

			<label htmlFor="alias">Alias</label>
			<input type="text" name="alias" id="alias" />

			<label htmlFor="content">Content</label>
			<textarea name="content" id="content"></textarea>

			<button type="submit">Create New Article</button>
		</form>
	);
};

const ArticleList = () => {
	const [articles, setArticles] = useState([]);

	const getArticles = async () => {};

	useEffect(() => {
		getArticles();
	}, []);

	return articles.map(({ _id, name, alias }) => (
		<div key={_id}>
			<h4>{name}</h4>
			<sup>{alias}</sup>
		</div>
	));
};

export default function Debug() {
	return (
		<>
			<div>
				<h1>Debug</h1>
				<p>
					This page exists for debugging purposes. Interacting with it
					blindly could introduce unexpected results, bugs, or crashes
					with your instance of the cms.
				</p>
			</div>

			<CreateArticleForm />
			<ArticleList />
		</>
	);
}
