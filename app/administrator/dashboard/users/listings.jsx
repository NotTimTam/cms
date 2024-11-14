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
import StorageInterface from "@/util/StorageInterface";
import { EllipsisVertical, Trash2, X } from "lucide-react";
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

const UserListings = () => {
	// Hooks
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { userQuery },
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
				const { name, email, _id } = users[index];

				return (
					<List.InfoBlock>
						<h3>
							<Link
								aria-label="Open User"
								href={`/administrator/dashboard/users?layout=edit&id=${_id}`}
							>
								{name}
							</Link>
						</h3>
						{email && (
							<p>
								<b>Email:</b> {email}
							</p>
						)}
					</List.InfoBlock>
				);
			}),
		},
		createdAt: {
			label: "Date Created",
			listing: new List.Element((index) =>
				new Date(users[index].createdAt).toLocaleString()
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
							<h3>Delete selected users permanently?</h3>
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

				if (res === true) await massDeleteUsers();
			},
		},
	];

	// States
	const [selection, setSelection] = useState([]);
	const [loading, setLoading] = useState(false);
	const [users, setUsers] = useState([]);
	const [query, setQuery] = useState(userQuery || defaultQuery);
	const [message, setMessage] = useState(null);

	// Functions
	const executeQuery = async () => {
		setLoading(true);
		setMessage(null);

		try {
			SessionStorage.setItem("userQuery", query); // Remember this query.

			// Create search params.
			const searchParams = API.createQueryString(query);

			// Get users.
			const token = await getToken();
			const {
				data: { users, page: newPage, numPages },
			} = await API.get(
				`${API.users}?${searchParams.toString()}`,
				API.createAuthorizationConfig(token)
			);

			setUsers(users.filter(({ locked }) => !locked));
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

	const reorderUser = async (active, over, dir) => {
		setLoading(true);
		setMessage(null);

		try {
			const token = await getToken();

			if (query.sort.dir === -1) dir *= -1;

			await API.patch(
				`${API.createRouteURL(
					API.users,
					"order"
				)}?active=${active}&over=${over}&dir=${dir}`,
				undefined,
				API.createAuthorizationConfig(token)
			);

			// Reload users.
			await executeQuery();
		} catch (error) {
			console.error(error);
			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const massDeleteUsers = async () => {
		setLoading(true);
		setMessage(null);

		try {
			const token = await getToken();

			// Create search params.
			const searchParams = API.createQueryString(query);

			// Batch through users.
			await API.delete(
				`${API.users}?${searchParams.toString()}&selection=${
					selection === "all" ? selection : selection.join(",")
				}`,
				API.createAuthorizationConfig(token)
			);

			await executeQuery();

			setSelection([]);
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
					new: "/administrator/dashboard/users?layout=edit",
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
						items={users}
						itemIdentifier="user"
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
								reorderUser(active, over, dir);
							},
						}}
					/>
				</>
			)}
		</>
	);
};

export default UserListings;