"use client";

import { useEffect, useState } from "react";
import Filter from "../../components/Filter";
import StorageInterface from "@/util/StorageInterface";
import Message from "../../components/Message";
import Curate from "../../components/Curate";
import styles from "./page.module.scss";
import Loading from "../../components/Loading";
import API from "@/util/API";
import {
	Archive,
	CheckCircle,
	ChevronsUpDown,
	CircleHelp,
	EllipsisVertical,
	Sparkles,
	Square,
	Trash2,
	X,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { capitalizeWords } from "@/util/display";

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
					<table className={styles["--cms-listings-table"]}>
						<thead>
							<tr>
								<th>
									<button aria-label="Select All">
										<Square />
									</button>
								</th>
								<th>
									<button aria-label="Order">
										<ChevronsUpDown />
									</button>
								</th>
								<th>
									<button aria-label="Featured">
										Featured <ChevronsUpDown />
									</button>
								</th>
								<th>
									<button aria-label="Status">
										Status <ChevronsUpDown />
									</button>
								</th>
								<th>
									<button aria-label="Title">
										Title <ChevronsUpDown />
									</button>
								</th>
								<th>
									<button aria-label="Access">
										Access <ChevronsUpDown />
									</button>
								</th>
								<th>
									<button aria-label="Author">
										Author <ChevronsUpDown />
									</button>
								</th>
								<th>
									<button aria-label="Date Created">
										Date Created <ChevronsUpDown />
									</button>
								</th>
								<th>
									<button aria-label="Hits">
										Hits <ChevronsUpDown />
									</button>
								</th>
							</tr>
						</thead>
						<tbody>
							{articles.map(
								({
									_id,
									name,
									alias,
									category,
									featured,
									status,
									access,
									author,
									createdAt,
									hits,
								}) => (
									<tr key={_id}>
										<td>
											<button aria-label="Select Article">
												<Square />
											</button>
										</td>
										<td>
											<button aria-label="Reorder Article">
												<EllipsisVertical />
											</button>
										</td>
										<td>
											<button aria-label="Featured">
												{featured ? (
													<Sparkles color="var(--warning-color)" />
												) : (
													<X />
												)}
											</button>
										</td>
										<td>
											<button aria-label="Status">
												{(() => {
													switch (status) {
														case "published":
															return (
																<CheckCircle color="var(--success-color)" />
															);
														case "unpublished":
															return (
																<XCircle color="var(--error-color)" />
															);
														case "trashed":
															return (
																<Trash2 color="var(--background-color-6)" />
															);
														case "archived":
															return (
																<Archive color="var(--info-color)" />
															);
														default:
															return (
																<CircleHelp />
															);
													}
												})()}
											</button>
										</td>
										<td
											className={
												styles[
													"--cms-article-listing-info"
												]
											}
										>
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
										</td>
										<td>{capitalizeWords(access)}</td>
										<td>{author}</td>
										<td>
											{new Date(
												createdAt
											).toLocaleString()}
										</td>
										<td>{hits}</td>
									</tr>
								)
							)}
						</tbody>
					</table>
				)}
			</section>
		</>
	);
};

export default Listings;
