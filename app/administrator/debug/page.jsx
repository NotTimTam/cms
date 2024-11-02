"use client";

import API from "@/util/api";
import { useEffect, useState } from "react";

const CreateArticleForm = ({ getArticles }) => {
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

					await API.post(`/api/articles`, {
						name,
						alias,
						content,
					});

					getArticles();
				} catch (err) {
					console.error(err.data);
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

const ArticleList = ({ articles }) => {
	return articles.map(({ _id, name, alias, content }) => (
		<div
			key={_id}
			style={{
				border: "1px solid black",
				padding: 8,
			}}
		>
			<h4>{name}</h4>
			<sup>{alias}</sup>
			<p>{content}</p>
		</div>
	));
};

export default function Debug() {
	const [articles, setArticles] = useState([]);

	const getArticles = async () => {
		try {
			setArticles((await API.get("/api/articles")).data.articles);
		} catch (err) {
			console.error(err.data);
		}
	};

	useEffect(() => {
		getArticles();
	}, []);

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

			<CreateArticleForm getArticles={getArticles} />
			<ArticleList articles={articles} />
		</>
	);
}
