"use client";

import Curate from "@/app/administrator/components/Curate";
import Filter from "@/app/administrator/components/Filter";
import List from "@/app/administrator/components/List";
import Loading from "@/app/administrator/components/Loading";
import Message from "@/app/administrator/components/Message";
import Modal from "@/app/administrator/components/Modal";
import { getToken } from "@/app/cookies";
import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";
import API from "@/util/API";
import {
	depthIndicator,
	findById,
	unflattenDocumentTree,
} from "@/util/display";
import StorageInterface from "@/util/StorageInterface";
import {
	Archive,
	CheckCircle2,
	CircleHelp,
	EllipsisVertical,
	Sparkle,
	Sparkles,
	Trash2,
	X,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

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
		data: { categoryQuery },
	} = SessionStorage;

	// Data
	const sortingOptions = {
		featured: {
			label: "Featured",
			listing: new List.Toggle(
				(id, items) =>
					findById(items, id).featured ? (
						<Sparkles color="var(--warning-color)" />
					) : (
						<Sparkle color="var(--background-color-6)" />
					),
				async (id, items) => {
					setLoading(true);

					setMessage(null);

					try {
						const token = await getToken();

						const category = findById(items, id);

						await API.patch(
							API.createRouteURL(API.categories, category._id),
							{ featured: !category.featured },
							API.createAuthorizationConfig(token)
						);

						await executeQuery();
					} catch (error) {
						console.error(error);
						console.error(error.data);
						setMessage(
							<Message type="error">
								<p>{error.data}</p>
							</Message>
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
				(id, items) => {
					const { status } = findById(items, id);

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
				async (id, items) => {
					setLoading(true);

					setMessage(null);

					try {
						const token = await getToken();

						const category = findById(items, id);

						await API.patch(
							API.createRouteURL(API.categories, category._id),
							{
								status:
									category.status === "published"
										? "unpublished"
										: "published",
							},
							API.createAuthorizationConfig(token)
						);

						await executeQuery();
					} catch (error) {
						console.error(error.data);
						setMessage(
							<Message type="error">
								<p>{error.data}</p>
							</Message>
						);
					}

					setLoading(false);
				},
				"Status"
			),
		},
		name: {
			label: "Name",
			listing: new List.Element((_id, items) => {
				const { name, depth } = findById(items, _id);

				return (
					<List.InfoBlock>
						<h3>
							{depthIndicator(depth)}
							<Link
								aria-label="Open Category"
								href={`/administrator/dashboard/categories?layout=edit&id=${_id}`}
							>
								{name}
							</Link>
						</h3>
					</List.InfoBlock>
				);
			}),
		},
		createdAt: {
			label: "Date Created",
			listing: new List.Element((_id, items) =>
				new Date(findById(items, _id).createdAt).toLocaleString()
			),
		},
	};

	const actions = [
		{
			label: (
				<>
					<Trash2 color="var(--error-color)" />
					Delete Permanently
				</>
			),
			ariaLabel: "Trash",
			action: async () => {
				const PopupContent = () => {
					const closePopup = useContext(PopupContext);

					return (
						<Modal>
							<h3>Delete selected categories permanently?</h3>
							<p>This action cannot be undone.</p>
							<Modal.Options>
								<button
									type="reset"
									aria-label="Cancel"
									className="--cms-success"
									onClick={() => closePopup(false)}
								>
									<X /> Cancel
								</button>
								<button
									type="submit"
									aria-label="Delete"
									className="--cms-error"
									onClick={() => closePopup(true)}
								>
									<Trash2 /> Delete Permanently
								</button>
							</Modal.Options>
						</Modal>
					);
				};

				const res = await createHeadlessPopup(<PopupContent />);

				if (res === true) await massDeleteCategories();
			},
		},
	];

	// States
	const [selection, setSelection] = useState([]);
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [query, setQuery] = useState(categoryQuery || defaultQuery);
	const [message, setMessage] = useState(null);

	// Functions
	const executeQuery = async () => {
		setLoading(true);
		setMessage(null);

		try {
			SessionStorage.setItem("categoryQuery", query); // Remember this query.

			// Create search params.
			const searchParams = API.createQueryString(query);

			// Get categories.
			const token = await getToken();
			const {
				data: { categories, page: newPage, numPages },
			} = await API.get(
				`${API.categories}/tree?${searchParams.toString()}`,
				API.createAuthorizationConfig(token)
			);

			setCategories(unflattenDocumentTree(categories));
			setQuery((query) => ({
				...query,
				page: newPage,
				numPages,
			}));
		} catch (error) {
			console.error(error);
			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);
		}

		setLoading(false);
	};

	const reorderCategory = async (active, over, dir) => {
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

			// Reload categories.
			await executeQuery();
		} catch (error) {
			console.error(error);
			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);
		}

		setLoading(false);
	};

	const massDeleteCategories = async () => {
		setLoading(true);
		setMessage(null);

		try {
			const token = await getToken();

			// Create search params.
			const searchParams = API.createQueryString(query);

			// Batch through categories.
			await API.delete(
				`${API.categories}?${searchParams.toString()}&selection=${
					selection === "all" ? selection : selection.join(",")
				}`,
				API.createAuthorizationConfig(token)
			);

			await executeQuery();

			setSelection([]);
		} catch (error) {
			console.error(error);
			setMessage(
				<Message type="error">
					<p>{error.data}</p>
				</Message>
			);
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
			{message && (
				<div style={{ padding: "var(--padding)" }}>{message}</div>
			)}
			{loading && <Loading />}
			{categories && (
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
								reorderCategory(active, over, dir);
							},
						}}
					/>
				</>
			)}
		</>
	);
};

export default Listings;
