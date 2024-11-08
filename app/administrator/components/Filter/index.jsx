"use client";

import { ChevronDown, FilterIcon, Search, X } from "lucide-react";
import styles from "./index.module.scss";
import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";
import { Fragment, useContext } from "react";
import Message from "../Message";

const Filter = ({
	query,
	setQuery,
	executeQuery,
	disabled,
	sortingOptions,
	filterOptions,
	defaultQuery = {},
}) => {
	// Handlers
	const handleSubmit = (e) => {
		e.preventDefault();
	};

	const handleClear = (e) => {
		e.preventDefault();

		setQuery(defaultQuery);
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
						disabled={
							disabled ||
							!filterOptions ||
							filterOptions.length === 0
						}
						type="button"
						className={`--cms-info --cms-popup-trigger ${styles["--cms-filter-form-search-tools"]}`}
						aria-label="Search Tools"
						onClick={async (e) => {
							const rect = e.target.getBoundingClientRect();

							const PopupContent = () => {
								const closePopup = useContext(PopupContext);

								return (
									<div
										className={
											styles[
												"--cms-filter-options-popup-content"
											]
										}
										onClick={closePopup}
									>
										<form
											onClick={(e) => e.stopPropagation()}
											onSubmit={(e) => {
												e.preventDefault();
											}}
											className={`--cms-form ${styles["--cms-filter-options-form"]}`}
										>
											<section>
												{filterOptions.map(
													(
														{ ariaLabel, readOnly },
														index
													) => {
														return (
															<span
																key={index}
																className={
																	styles[
																		"--cms-filter-options-form-input-group"
																	]
																}
															>
																<input
																	type="text"
																	aria-label={
																		ariaLabel
																	}
																	placeholder={
																		ariaLabel
																	}
																	readOnly={
																		readOnly
																	}
																/>
																<button
																	className="--cms-info"
																	type="button"
																	aria-label={
																		ariaLabel
																	}
																>
																	<ChevronDown />
																</button>
															</span>
														);
													}
												)}
											</section>

											<section>
												<button
													type="reset"
													aria-label="Cancel"
													className="--cms-error"
												>
													<X /> Cancel
												</button>

												<button
													type="submit"
													aria-label="Filter"
													className="--cms-success"
												>
													<FilterIcon /> Filter
												</button>
											</section>
										</form>
									</div>
								);
							};

							const res = await createHeadlessPopup(
								<PopupContent />,
								[rect.x, rect.bottom]
							);
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
					disabled={
						disabled ||
						!sortingOptions ||
						sortingOptions.length === 0
					}
					type="button"
					aria-label="Sort By"
					className="--cms-highlight --cms-popup-trigger"
					onClick={async (e) => {
						const rect = e.target.getBoundingClientRect();

						const PopupContent = () => {
							const closePopup = useContext(PopupContext);

							return (
								<div
									className="--cms-popup-content"
									style={{ minWidth: rect.width }}
								>
									<nav className="--cms-popup-nav">
										{Object.entries(sortingOptions).map(
											([field, { label }], index) => {
												return (
													<Fragment key={index}>
														<button
															type="button"
															aria-label={`${label} Ascending.`}
															onClick={() =>
																closePopup({
																	field,
																	dir: -1,
																})
															}
														>
															{label} Ascending
														</button>
														<button
															type="button"
															aria-label={`${label} Descending.`}
															onClick={() =>
																closePopup({
																	field,
																	dir: 1,
																})
															}
														>
															{label} Descending
														</button>
													</Fragment>
												);
											}
										)}
									</nav>
								</div>
							);
						};

						const sort = await createHeadlessPopup(
							<PopupContent />,
							[rect.x, rect.bottom]
						);

						if (sort) {
							setQuery({ ...query, sort });
						}
					}}
				>
					{query.sort ? (
						<>
							{sortingOptions[query.sort.field].label}{" "}
							{query.sort.dir === -1 ? "Ascending" : "Descending"}
						</>
					) : (
						"Sort By"
					)}
					<ChevronDown />
				</button>
				<button
					disabled={disabled}
					type="button"
					className="--cms-highlight --cms-popup-trigger"
					aria-label="Items Per Page"
					onClick={async (e) => {
						const rect = e.target.getBoundingClientRect();

						const PopupContent = () => {
							const closePopup = useContext(PopupContext);

							const potentialItemsPerPage = [
								5,
								10,
								15,
								20,
								25,
								30,
								50,
								100,
								200,
								500,
								"all",
							];

							return (
								<div
									className="--cms-popup-content"
									style={{ minWidth: rect.width }}
								>
									<nav className="--cms-popup-nav">
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
