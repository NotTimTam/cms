"use client";

import { useEffect, useState } from "react";
import StorageInterface from "@/util/StorageInterface";
import Message from "../../components/Message";
import Curate from "../../components/Curate";
import API from "@/util/API";
import List from "../../components/List";
import Loading from "../../components/Loading";
import {
	Archive,
	CheckCircle,
	ChevronDown,
	ChevronsUpDown,
	ChevronUp,
	CircleHelp,
	Sparkle,
	Sparkles,
	Trash2,
	XCircle,
} from "lucide-react";
import styles from "./page.module.scss";
import Link from "next/link";
import { capitalizeWords } from "@/util/display";
import Filter from "../../components/Filter";

let lastQuery;

const Listings = () => {
	// Hooks
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { articleQuery },
	} = SessionStorage;

	// Data
	const sortingOptions = {
		// "order",
		featured: {
			label: "Featured",
			listing: new List.Toggle(
				(index) =>
					articles[index].featured ? (
						<Sparkles color="var(--warning-color)" />
					) : (
						<Sparkle color="var(--background-color-6)" />
					),
				(index) =>
					console.warn("NO LOGIC TO HANDLE FEATURING AN ARTICLE"),
				"Featured"
			),
		},
		status: {
			label: "Status",
			listing: new List.Toggle(
				(index) => {
					const { status } = articles[index];

					switch (status) {
						case "published":
							return <CheckCircle color="var(--success-color)" />;
						case "unpublished":
							return <XCircle color="var(--error-color)" />;
						case "trashed":
							return <Trash2 color="var(--background-color-6)" />;
						case "archived":
							return <Archive color="var(--info-color)" />;
						default:
							return <CircleHelp />;
					}
				},
				(index) =>
					console.warn("NO LOGIC TO HANDLE CHANGING ARTICLE STATUS"),
				"Status"
			),
		},
		title: {
			label: "Title",
			listing: new List.Element((index) => {
				const { name, alias, category, _id } = articles[index];

				return (
					<div className={styles["--cms-article-listing-info"]}>
						<h3>
							<Link
								aria-label="Open Article"
								href={`/administrator/dashboard/articles?view=edit&id=${_id}`}
							>
								{name}
							</Link>
						</h3>
						<p>
							<b>Alias:</b> {alias}
						</p>
						{category && (
							<p>
								<b>Category:</b> {category}
							</p>
						)}
					</div>
				);
			}),
		},
		access: {
			label: "Access",
			listing: new List.Element((index) =>
				capitalizeWords(articles[index].access)
			),
		},
		author: {
			label: "Author",
			listing: new List.Element((index) => (
				<Link
					href={`/administrator/dashboard/users/${articles[index].author._id}`}
				>
					{articles[index].author.name}
				</Link>
			)),
		},
		createdAt: {
			label: "Date Created",
			listing: new List.Element((index) =>
				new Date(articles[index].createdAt).toLocaleString()
			),
		},
		hits: {
			label: "Hits",
			listing: new List.Element((index) => articles[index].hits),
		},
	};

	// States
	const [selection, setSelection] = useState([]);
	const [loading, setLoading] = useState(false);
	const [articles, setArticles] = useState([]);
	const [query, setQuery] = useState(
		articleQuery || {
			search: "",
			itemsPerPage: 20,
			sort: {
				field: "title",
				dir: 1,
			},
		}
	);
	const [message, setMessage] = useState(null);

	// Functions
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

	useEffect(() => {
		/**
		 * Ensure that query auto-execution does not occur just because text has been entered into the search field.
		 */

		if (lastQuery) {
			const parsed = JSON.parse(lastQuery);

			let changed = [];

			for (const [key, value] of Object.entries(query)) {
				const checkValue =
					typeof parsed[key] === "object"
						? JSON.stringify(parsed[key])
						: parsed[key];
				const currentValue =
					typeof value === "object" ? JSON.stringify(value) : value;

				if (checkValue !== currentValue) changed.push(key);
			}

			changed = changed.filter((key) => key !== "search");

			if (changed.length > 0) executeQuery();
		}

		lastQuery = JSON.stringify(query);
	}, [query]);

	return (
		<>
			<Curate
				{...{
					new: "/administrator/dashboard/articles?view=edit",
				}}
			/>
			{message && (
				<div className={styles["--cms-message-container"]}>
					{message}
				</div>
			)}
			{loading ? (
				<Loading />
			) : (
				<>
					<Filter
						{...{ query, setQuery, executeQuery, sortingOptions }}
					/>

					<List
						items={articles}
						itemIdentifier="article"
						fields={Object.entries(sortingOptions).map(
							([field, { label, listing }]) => {
								const active =
									query.sort && query.sort.field === field;
								const dir = query.sort && query.sort.dir;

								return {
									listing,
									header: (
										<button
											aria-label={label}
											onClick={() => {
												if (active) {
													if (dir === 1)
														setQuery((query) => ({
															...query,
															sort: {
																field,
																dir: -1,
															},
														}));
													else {
														const newQuery = {
															...query,
														};
														delete newQuery.sort;
														setQuery(newQuery);
													}
												} else
													setQuery((query) => ({
														...query,
														sort: { field, dir: 1 },
													}));
											}}
										>
											{label}{" "}
											{active ? (
												dir === -1 ? (
													<ChevronUp />
												) : (
													<ChevronDown />
												)
											) : (
												<ChevronsUpDown />
											)}
										</button>
									),
								};
							}
						)}
						{...{ selection, setSelection }}
						{...{ query, setQuery, executeQuery }}
					/>
				</>
			)}
		</>
	);
};

export default Listings;
