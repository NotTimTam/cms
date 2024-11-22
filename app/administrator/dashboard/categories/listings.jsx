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
import Link from "next/link";
import { findById } from "@/util/display";
import Filter from "../../components/Filter";
import { getToken } from "@/app/cookies";

let lastQuery;

const defaultQuery = {
	search: "",
	page: 0,
	itemsPerPage: 20,
	sort: {
		field: "createdAt",
		dir: -1,
	},
	status: "normal",
};

const Listings = () => {
	// Hooks
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { categoryQuery },
	} = SessionStorage;

	// Data
	const sortingOptions = {
		featured: {
			label: "Featured",
			listing: new List.Toggle(
				(id) =>
					findById(categories, id).featured ? (
						<Sparkles color="var(--warning-color)" />
					) : (
						<Sparkle color="var(--background-color-6)" />
					),
				async (id) => {
					setLoading(true);

					setMessage(null);

					try {
						const token = await getToken();

						const category = findById(categories, id);

						const {
							data: { category: newCategory },
						} = await API.patch(
							API.createRouteURL(API.categories, category._id),
							{ featured: !category.featured },
							API.createAuthorizationConfig(token)
						);

						let newCategoryListings = [...categories];

						newCategoryListings[index] = {
							...category,
							featured: newCategory.featured,
						};

						setCategories(newCategoryListings);
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
				(id) => {
					const { status } = findById(categories, id);

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
							return <Archive color="var(--warning-color)" />;
						default:
							return <CircleHelp />;
					}
				},
				async (id) => {
					setLoading(true);

					setMessage(null);

					try {
						const token = await getToken();

						const category = findById(categories, id);

						const {
							data: { category: newCategory },
						} = await API.patch(
							API.createRouteURL(API.categories, category._id),
							{
								status:
									category.status === "published"
										? "unpublished"
										: "published",
							},
							API.createAuthorizationConfig(token)
						);

						let newCategoryListings = [...categories];

						newCategoryListings[index] = {
							...category,
							status: newCategory.status,
						};

						setCategories(newCategoryListings);
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
			listing: new List.Element((id) => {
				const { name, alias, category, _id } = findById(categories, id);

				return (
					<List.InfoBlock>
						<b>
							<Link
								aria-label="Open Category"
								href={`/administrator/dashboard/categories?layout=edit&id=${_id}`}
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
					</List.InfoBlock>
				);
			}),
		},
		// access: {
		// 	label: "Access",
		// 	listing: new List.Element((id) =>
		// 		capitalizeWords(findById(categories, id).access)
		// 	),
		// },
		author: {
			label: "Author",
			listing: new List.Element((id) => {
				const author = findById(categories, id).author;
				return author ? (
					<Link
						href={`/administrator/dashboard/users?layout=edit&id=${author._id}`}
					>
						{author.name}
					</Link>
				) : (
					<b>None</b>
				);
			}),
		},
		createdAt: {
			label: "Date Created",
			listing: new List.Element((id) =>
				new Date(findById(categories, id).createdAt).toLocaleString()
			),
		},
		hits: {
			label: "Hits",
			listing: new List.Element((id) => findById(categories, id).hits),
		},
	};

	const actions = [
		{
			label: (
				<>
					<Sparkles color="var(--warning-color)" />
					Feature
				</>
			),
			ariaLabel: "Feature",
			action: async () => await executeBatch({ featured: true }),
		},
		{
			label: (
				<>
					<Sparkle color="var(--background-color-6)" />
					Unfeature
				</>
			),
			ariaLabel: "Unfeature",
			action: async () => await executeBatch({ featured: false }),
		},
		{
			label: (
				<>
					<CheckCircle2 color="var(--success-color)" />
					Publish
				</>
			),
			ariaLabel: "Publish",
			action: async () => await executeBatch({ status: "published" }),
		},
		{
			label: (
				<>
					<XCircle color="var(--error-color)" />
					Unpublish
				</>
			),
			ariaLabel: "Unpublish",
			action: async () => await executeBatch({ status: "unpublished" }),
		},
		{
			label: (
				<>
					<Archive color="var(--warning-color)" />
					Archive
				</>
			),
			ariaLabel: "Trash",
			action: async () => await executeBatch({ status: "archived" }),
		},
		{
			label: (
				<>
					<Trash2 color="var(--error-color)" />
					Trash
				</>
			),
			ariaLabel: "Trash",
			action: async () => await executeBatch({ status: "trashed" }),
		},
	];

	const filterOptions = [
		/**
		 * Select Featured
		 * Select Status
		 * Select Category
		 * Select Access
		 * Select Author
		 * Select Tag
		 * Select Max Levels
		 *
		 * group of dropdowns with darker background
		 * each dropdown is both a text input for filtration, and a selection list. In the case of authors, the dropdown shows the word "None" and the top 5 authors on the site.
		 */
		// {
		// 	ariaLabel: "Featured",
		// 	getter: {
		// 		type: "static",
		// 		data: [
		// 			{
		// 				id: false,
		// 				label: "Unfeatured",
		// 			},
		// 			{
		// 				id: true,
		// 				label: "Featured",
		// 			},
		// 		],
		// 	},
		// },
		// {
		// 	ariaLabel: "Status",
		// 	getter: {
		// 		type: "static",
		// 		data: statusEnum.map((item) => ({
		// 			id: item,
		// 			label: capitalizeWords(item),
		// 		})),
		// 	},
		// },
		// {
		// 	ariaLabel: "Category",
		// 	getter: {},
		// },
		// {
		// 	ariaLabel: "Access",
		// 	getter: {},
		// },
		// {
		// 	ariaLabel: "Author",
		// 	getter: {},
		// },
		// {
		// 	ariaLabel: "Tag",
		// 	getter: {},
		// },
		// {
		// 	ariaLabel: "Max Levels", // For other dropdowns.
		// },
	];

	// States
	const [selection, setSelection] = useState([]);
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState(null);
	const [query, setQuery] = useState(categoryQuery || defaultQuery);
	const [message, setMessage] = useState(null);

	// Functions
	const executeQuery = async () => {
		setLoading(true);
		setMessage(null);

		try {
			const token = await getToken();

			SessionStorage.setItem("categoryQuery", query); // Remember this query.

			// Create search params.
			const searchParams = API.createQueryString(query);

			// Get categories.
			const {
				data: { categories, page: newPage, numPages },
			} = await API.get(
				`${API.categories}?${searchParams.toString()}`,
				API.createAuthorizationConfig(token)
			);

			setCategories(categories);
			setQuery((query) => ({
				...query,
				page: newPage,
				numPages,
			}));
		} catch (error) {
			console.error(error);
			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const reorderCategories = async (active, over, dir) => {
		setLoading(true);
		setMessage(null);

		try {
			const token = await getToken();

			if (query.sort.dir === -1) dir *= -1;

			await API.patch(
				`${API.createRouteURL(
					API.categories,
					"order"
				)}?active=${active}&over=${over}&dir=${dir}`,
				undefined,
				API.createAuthorizationConfig(token)
			);

			// Reload user roles.
			await executeQuery();
		} catch (error) {
			console.error(error);
			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const executeBatch = async (patch) => {
		setLoading(true);
		setMessage(null);

		try {
			const token = await getToken();

			// Create search params.
			const searchParams = API.createQueryString(query);

			// Batch through categories.
			await API.patch(
				`${API.createRouteURL(
					API.categories,
					"batch"
				)}?${searchParams.toString()}&selection=${
					selection === "all" ? selection : selection.join(",")
				}`,
				patch,
				API.createAuthorizationConfig(token)
			);

			await executeQuery();
		} catch (error) {
			console.error(error);
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

	// Clear the selection only when the results of the search differ.
	useEffect(() => {
		setSelection([]);
	}, [query.search]);

	return (
		<>
			<Curate
				{...{
					new: "/administrator/dashboard/categories?layout=edit",
					actions: selection.length > 0 && actions,
				}}
			/>
			{message && <div className="--cms-padding">{message}</div>}
			{loading || !categories ? (
				<Loading />
			) : (
				<>
					<Filter
						{...{
							query,
							setQuery,
							executeQuery,
							sortingOptions,
							filterOptions,
							defaultQuery,
						}}
					/>

					<List
						items={categories}
						itemIdentifier="categories"
						fields={Object.entries(sortingOptions).map(
							([field, { label, listing }]) => ({
								listing,
								header: List.Header(
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
							swapItems: (active, over, dir) => {
								reorderCategories(active, over, dir);
							},
						}}
					/>
				</>
			)}
		</>
	);
};

export default Listings;
