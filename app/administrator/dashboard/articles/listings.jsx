"use client";

import { useEffect, useState } from "react";
import Filter from "../../components/Filter";
import StorageInterface from "@/util/StorageInterface";
import Message from "../../components/Message";
import Curate from "../../components/Curate";
import styles from "./page.module.scss";
import Loading from "../../components/Loading";
import API from "@/util/API";

const Listings = () => {
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { articleQuery },
	} = SessionStorage;

	const [loading, setLoading] = useState(false);
	const [articles, setArticles] = useState([]);
	const [query, setQuery] = useState(
		articleQuery || {
			search: "",
			itemsPerPage: 20,
		}
	);
	const [message, setMessage] = useState(null);

	const executeQuery = async () => {
		setLoading(true);

		try {
			SessionStorage.setItem("articleQuery", query); // Remember this query.

			// Get articles.
			const {
				data: { articles },
			} = await API.get(API.articles);

			setArticles(articles);
		} catch (err) {
			console.error(err.data);
			setMessage(<Message type="error">{err.data}</Message>);
		}

		setLoading(false);
	};

	useEffect(() => {
		executeQuery();
	}, []);

	return (
		<>
			<Curate
				{...{
					new: "/administrator/dashboard/articles?view=edit",
				}}
			/>
			<section className={styles["--cms-listings"]}>
				<Filter
					{...{ disabled: loading, query, setQuery, executeQuery }}
				/>
				{message}
				{loading ? (
					<Loading />
				) : articles.length === 0 ? (
					<Message type="info">
						No articles found with that query.
					</Message>
				) : (
					<table>
						<thead>
							<th>CHECKBOX</th>
							<th>DRAG ICON</th>
							<th>FEATURED</th>
							<th>STATUS</th>
							<th>TITLE</th>
							<th>ACCESS</th>
							<th>AUTHOR</th>
							<th>DATE CREATED</th>
							<th>HITS</th>
						</thead>
						<tbody>
							<tr>
								ROW
								<td>CELL</td>
								<td>
									<>LOCK INDICATOR + Title (as link)</>
									<>Alias: alias</>
									<>Category: Category (as link)</>
								</td>
							</tr>
						</tbody>
					</table>
				)}
			</section>
		</>
	);
};

export default Listings;
