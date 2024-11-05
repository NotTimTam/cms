"use client";

import { ChevronDown, Search } from "lucide-react";
import styles from "./index.module.scss";
import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";
import { useContext } from "react";
import Message from "../Message";

const Filter = ({ query, setQuery, executeQuery, disabled }) => {
	// Handlers
	const handleSubmit = (e) => {
		e.preventDefault();

		executeQuery();
	};

	const handleClear = (e) => {
		e.preventDefault();

		setQuery({});

		executeQuery();
	};

	if (!query)
		return (
			<Message type="error">
				No query attribute passed to Filter component.
			</Message>
		);

	return (
		<form
			disabled={disabled}
			onSubmit={handleSubmit}
			className={`--cms-form ${styles["--cms-filter-form"]}`}
		>
			<section>
				<span>
					<input
						disabled={disabled}
						type="text"
						placeholder="Search"
						aria-placeholder="Search"
						aria-autocomplete="none"
						autoComplete="off"
						value={query.search || ""}
						onChange={({ target: { value } }) =>
							setQuery((query) => ({ ...query, search: value }))
						}
					/>
					<button
						disabled={disabled}
						type="submit"
						aria-label="Search"
						className="--cms-info"
						onClick={executeQuery}
					>
						<Search />
					</button>
				</span>
				<span>
					<button
						disabled={disabled}
						type="button"
						className={`--cms-info ${styles["--cms-filter-form-search-tools"]}`}
						aria-label="Search Tools"
						onClick={async (e) => {
							const rect = e.target.getBoundingClientRect();

							const PopupContent = () => {
								const closePopup = useContext(PopupContext);

								return (
									<div
										className="--cms-popup-content"
										style={{ minWidth: rect.width }}
									>
										<nav
											className={
												styles["--cms-popup-nav"]
											}
										>
											<ul>
												<li>Category</li>
												<li>Tag</li>
												<li>Author</li>
											</ul>
										</nav>
									</div>
								);
							};

							const res = await createHeadlessPopup(
								<PopupContent />,
								[rect.x, rect.bottom]
							);

							executeQuery();
						}}
					>
						Filter Options <ChevronDown />
					</button>
					<button
						disabled={disabled}
						onClick={handleClear}
						type="reset"
						aria-label="Clear Search"
						className={styles["--cms-filter-form-clear"]}
					>
						Clear
					</button>
				</span>
			</section>

			<section>
				<button
					disabled={disabled}
					type="button"
					aria-label="Sort By"
					className="--cms-highlight"
					onClick={async (e) => {
						const rect = e.target.getBoundingClientRect();

						const PopupContent = () => {
							const closePopup = useContext(PopupContext);

							return (
								<div
									className="--cms-popup-content"
									style={{ minWidth: rect.width }}
								>
									<nav className={styles["--cms-popup-nav"]}>
										<button
											type="button"
											aria-label="Sort by date created, ascending."
											onClick={() =>
												closePopup({
													field: "createdAt",
													direction: -1,
												})
											}
										>
											Date Created Ascending
										</button>

										<button
											type="button"
											aria-label="Sort by date created, descending."
											onClick={() =>
												closePopup({
													field: "createdAt",
													direction: 1,
												})
											}
										>
											Date Created Descending
										</button>
									</nav>
								</div>
							);
						};

						const res = await createHeadlessPopup(
							<PopupContent />,
							[rect.x, rect.bottom]
						);

						executeQuery();
					}}
				>
					Sort By <ChevronDown />
				</button>
				<button
					disabled={disabled}
					type="button"
					className="--cms-highlight"
					aria-label="Items Per Page"
					onClick={async (e) => {
						const rect = e.target.getBoundingClientRect();

						const PopupContent = () => {
							const closePopup = useContext(PopupContext);

							const potentialItemsPerPage = [
								20,
								50,
								100,
								200,
								500,
								1000,
								"all",
							];

							return (
								<div
									className="--cms-popup-content"
									style={{ minWidth: rect.width }}
								>
									<nav className={styles["--cms-popup-nav"]}>
										{potentialItemsPerPage.map(
											(count, index) => (
												<button
													aria-selected={
														query.itemsPerPage ===
														count
															? "true"
															: undefined
													}
													key={index}
													type="button"
													aria-label={`Show ${count} ${
														count === "all"
															? "items."
															: "items per page."
													}`}
													onClick={() =>
														closePopup(count)
													}
												>
													{count === "all"
														? `All`
														: String(count)}
												</button>
											)
										)}
									</nav>
								</div>
							);
						};

						const itemsPerPage = await createHeadlessPopup(
							<PopupContent />,
							[rect.x, rect.bottom]
						);

						if (itemsPerPage != null) {
							setQuery((query) => ({ ...query, itemsPerPage }));

							executeQuery();
						}
					}}
				>
					{(query.itemsPerPage === "all"
						? "All"
						: query.itemsPerPage) || "20"}{" "}
					<ChevronDown />
				</button>
			</section>
		</form>
	);
};

export default Filter;
