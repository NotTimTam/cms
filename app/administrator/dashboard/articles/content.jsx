"use client";

import { useState } from "react";
import Filter from "../../components/Filter";
import StorageInterface from "@/util/StorageInterface";
import Message from "../../components/Message";
import Curate from "../../components/Curate";
import styles from "./page.module.scss";

const Content = () => {
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { articleQuery },
	} = SessionStorage;

	const [loading, setLoading] = useState(false);
	const [articles, setArticles] = useState([]);
	const [query, setQuery] = useState(
		articleQuery || {
			itemsPerPage: 20,
		}
	);
	const [message, setMessage] = useState(null);

	const executeQuery = (query) => {
		try {
			SessionStorage.setItem("articleQuery", query); // Remember this query.
		} catch (err) {
			console.error(err.data);
			setMessage(<message type="error">{err.data}</message>);
		}
	};

	return (
		<>
			<Curate {...{}} />
			<section className={styles["--cms-listings"]}>
				<Filter
					{...{ disabled: loading, query, setQuery, executeQuery }}
				/>
				{message}
				{articles.length === 0 && (
					<Message type="info">
						No articles found with that query.
					</Message>
				)}
			</section>
		</>
	);
};

export default Content;
