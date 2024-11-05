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
	CircleHelp,
	EllipsisVertical,
	Sparkles,
	Square,
	Trash2,
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
					<table>
						<thead>
							<tr>
								<th>
									<Square />
								</th>
								<th>
									<EllipsisVertical />
								</th>
								<th>FEATURED</th>
								<th>STATUS</th>
								<th>TITLE</th>
								<th>ACCESS</th>
								<th>AUTHOR</th>
								<th>DATE CREATED</th>
								<th>HITS</th>
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
										<th>
											<Square />
										</th>
										<th>
											<EllipsisVertical />
										</th>
										<th>
											{featured && (
												<Sparkles color="var(--warning-color)" />
											)}
										</th>
										<th>
											{(() => {
												console.log(status);
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
														return <CircleHelp />;
												}
											})()}
										</th>
										<th>
											<h3>
												<Link
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
										</th>
										<th>{capitalizeWords(access)}</th>
										<th>{author}</th>
										<th>{createdAt}</th>
										<th>{hits}</th>
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
