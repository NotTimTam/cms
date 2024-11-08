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
	CheckCircle2,
	CircleHelp,
	EllipsisVertical,
	Sparkle,
	Sparkles,
	Trash2,
	XCircle,
} from "lucide-react";
import styles from "./page.module.scss";
import Link from "next/link";
import { capitalizeWords } from "@/util/display";
import Filter from "../../components/Filter";
import { getToken } from "@/app/cookies";
import Paginate from "../../components/Paginate";

let lastQuery;

const defaultQuery = {
	search: "",
	page: 0,
	itemsPerPage: 20,
	sort: {
		field: "createdAt",
		dir: -1,
	},
};

const Listings = () => {
	// Hooks
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { articleQuery },
	} = SessionStorage;

	// Data
	const sortingOptions = {
		order: {
			label: "Order",
			hideFromList: true,
		},
		featured: {
			label: "Featured",
			listing: new List.Toggle(
				(index) =>
					articles[index].featured ? (
						<Sparkles color="var(--warning-color)" />
					) : (
						<Sparkle color="var(--background-color-6)" />
					),
				async (index) => {
					setLoading(true);

					setMessage(null);

					try {
						const token = await getToken();

						const article = articles[index];

						const {
							data: { article: newArticle },
						} = await API.patch(
							API.createRouteURL(API.articles, article._id),
							{ featured: !article.featured },
							API.createAuthorizationConfig(token)
						);

						let newArticleListings = [...articles];

						newArticleListings[index] = {
							...article,
							featured: newArticle.featured,
						};

						setArticles(newArticleListings);
					} catch (error) {
						console.error(error.data);
						setMessage(
							<Message type="error">{error.data}</Message>
						);
					}

					setLoading(false);
				},
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
							return (
								<CheckCircle2 color="var(--success-color)" />
							);
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
				async (index) => {
					setLoading(true);

					setMessage(null);

					try {
						const token = await getToken();

						const article = articles[index];

						const {
							data: { article: newArticle },
						} = await API.patch(
							API.createRouteURL(API.articles, article._id),
							{
								status:
									article.status === "published"
										? "unpublished"
										: "published",
							},
							API.createAuthorizationConfig(token)
						);

						let newArticleListings = [...articles];

						newArticleListings[index] = {
							...article,
							status: newArticle.status,
						};

						setArticles(newArticleListings);
					} catch (error) {
						console.error(error.data);
						setMessage(
							<Message type="error">{error.data}</Message>
						);
					}

					setLoading(false);
				},
				"Status"
			),
		},
		name: {
			label: "Name",
			listing: new List.Element((index) => {
				const { name, alias, category, _id } = articles[index];

				return (
					<p className={styles["--cms-article-listing-info"]}>
						<b
							className={
								styles["--cms-article-listing-info-title"]
							}
						>
							<Link
								aria-label="Open Article"
								href={`/administrator/dashboard/articles?layout=edit&id=${_id}`}
							>
								{name}
							</Link>
						</b>
						<span>
							<b>Alias:</b> {alias}
						</span>
						{category && (
							<span>
								<b>Category:</b> {category}
							</span>
						)}
					</p>
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
					href={`/administrator/dashboard/users?layout=edit&id=${articles[index].author._id}`}
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
	const [query, setQuery] = useState(articleQuery || defaultQuery);
	const [message, setMessage] = useState(null);

	// Functions
	const executeQuery = async () => {
		setLoading(true);

		try {
			SessionStorage.setItem("articleQuery", query); // Remember this query.

			// Calculate search params.
			const { search, page, itemsPerPage, sort } = query;
			const searchParams = new URLSearchParams();

			if (search) searchParams.append("search", search);
			if (page) searchParams.append("page", page);
			if (itemsPerPage) searchParams.append("itemsPerPage", itemsPerPage);
			if (sort) {
				searchParams.append("sortField", sort.field);
				searchParams.append("sortDir", sort.dir);
			}

			// Get articles.
			const {
				data: { articles, page: newPage, numPages },
			} = await API.get(`${API.articles}?${searchParams.toString()}`);

			setArticles(articles);
			setQuery((query) => ({
				...query,
				page: newPage,
				numPages,
			}));
		} catch (error) {
			console.error(error.data);
			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const executeBatch = async (batch) => {
		setLoading(true);

		try {
			const token = await getToken();

			// Batch through articles.
			for (const article of batch) {
				// Run patch request.
				await API.patch(
					API.createRouteURL(API.articles, article._id),
					article,
					API.createAuthorizationConfig(token)
				);
			}

			// Reload articles.
			await executeQuery();
		} catch (error) {
			console.error(error.data);
			setMessage(<Message type="error">{error.data}</Message>);
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

			let changed = [
				...Object.entries(query)
					.filter(([key, value]) => {
						const checkValue =
							typeof parsed[key] === "object"
								? JSON.stringify(parsed[key])
								: parsed[key];
						const currentValue =
							typeof value === "object"
								? JSON.stringify(value)
								: value;

						if (checkValue !== currentValue) return true;
						else return false;
					})
					.map(([key]) => key),
				...Object.entries(parsed)
					.filter(([key, value]) => {
						const checkValue =
							typeof query[key] === "object"
								? JSON.stringify(query[key])
								: query[key];
						const currentValue =
							typeof value === "object"
								? JSON.stringify(value)
								: value;

						if (checkValue !== currentValue) return true;
						else return false;
					})
					.map(([key]) => key),
			];

			changed = changed.filter((key) => key !== "search");

			if (changed.length > 0) executeQuery();
		}

		lastQuery = JSON.stringify(query);
	}, [query]);

	return (
		<>
			<Curate
				{...{
					new: "/administrator/dashboard/articles?layout=edit",
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
						{...{
							query,
							setQuery,
							executeQuery,
							sortingOptions,
							defaultQuery,
						}}
					/>

					<List
						items={articles}
						itemIdentifier="article"
						fields={Object.entries(sortingOptions).map(
							([field, { label, listing, hideFromList }]) => ({
								listing,
								header:
									!hideFromList &&
									List.Header(
										{
											field,
											label: label,
										},
										query,
										setQuery
									),
							})
						)}
						{...{ selection, setSelection }}
						{...{ query, setQuery, executeQuery }}
						{...{
							order: {
								field: "order",
								icon: <EllipsisVertical />,
								ariaLabel: "Reorder",
								disabled:
									!query.sort || query.sort.field !== "order",
							},
							swapItems: (active, over) => {
								executeBatch([
									{
										_id: active,
										order: articles.find(
											({ _id }) => _id === over
										).order,
									},
									{
										_id: over,
										order: articles.find(
											({ _id }) => _id === active
										).order,
									},
								]);
							},
						}}
					/>

					<Paginate {...{ query, setQuery }} />
				</>
			)}
		</>
	);
};

export default Listings;
