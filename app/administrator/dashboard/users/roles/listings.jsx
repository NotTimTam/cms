"use client";

import Curate from "@/app/administrator/components/Curate";
import Filter from "@/app/administrator/components/Filter";
import List from "@/app/administrator/components/List";
import Loading from "@/app/administrator/components/Loading";
import Message from "@/app/administrator/components/Message";
import { getToken } from "@/app/cookies";
import API from "@/util/API";
import StorageInterface from "@/util/StorageInterface";
import { EllipsisVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const RoleListings = () => {
	// Hooks
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { roleQuery },
	} = SessionStorage;

	// Data
	const sortingOptions = {
		order: {
			label: "Order",
			hideFromList: true,
		},
		name: {
			label: "Name",
			listing: new List.Element((index) => {
				const { name, alias, category, _id } = userRoles[index];

				return (
					<List.InfoBlock>
						<h3>
							<Link
								aria-label="Open Role"
								href={`/administrator/dashboard/users?view=roles&layout=edit&id=${_id}`}
							>
								{name}
							</Link>
						</h3>
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
		createdAt: {
			label: "Date Created",
			listing: new List.Element((index) =>
				new Date(userRoles[index].createdAt).toLocaleString()
			),
		},
	};

	const actions = [
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

	// States
	const [selection, setSelection] = useState([]);
	const [loading, setLoading] = useState(false);
	const [userRoles, setUserRoles] = useState([]);
	const [query, setQuery] = useState(roleQuery || defaultQuery);
	const [message, setMessage] = useState(null);

	// Functions
	const executeQuery = async () => {
		setLoading(true);
		setMessage(null);

		try {
			SessionStorage.setItem("roleQuery", query); // Remember this query.

			// Create search params.
			const searchParams = API.createQueryString(query);

			// Get userRoles.
			const token = await getToken();
			const {
				data: { userRoles, page: newPage, numPages },
			} = await API.get(
				`${API.userRoles}?${searchParams.toString()}`,
				API.createAuthorizationConfig(token)
			);

			setUserRoles(userRoles);
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

	const reorderUserRole = async (active, over, dir) => {
		setLoading(true);
		setMessage(null);

		try {
			const token = await getToken();

			if (query.sort.dir === -1) dir *= -1;

			await API.patch(
				`${API.createRouteURL(
					API.userRoles,
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

			// Batch through userRoles.
			await API.patch(
				`${API.createRouteURL(
					API.userRoles,
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
					new: "/administrator/dashboard/users?view=roles&layout=edit",
					actions: selection.length > 0 && actions,
				}}
			/>
			{message && (
				<div style={{ padding: "var(--padding)" }}>{message}</div>
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
						items={userRoles}
						itemIdentifier="role"
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
							swapItems: (active, over, dir) => {
								reorderUserRole(active, over, dir);
							},
						}}
					/>
				</>
			)}
		</>
	);
};

export default RoleListings;
