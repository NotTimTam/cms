"use client";

import { ChevronDown, Search } from "lucide-react";
import styles from "./index.module.scss";
import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";
import { Fragment, useContext, useEffect, useState } from "react";
import Message from "../Message";
import Loading from "../Loading";

const Option = ({
	option: {
		ariaLabel,
		state: [option, setOption],
		getter,
		getter: { type: dataType },
		type: optionType,
	},
	expanded,
	setExpanded,
}) => {
	const [data, setData] = useState(null);
	const [search, setSearch] = useState(null);

	const getData = async () => {
		if (dataType === "static") setData(getter.data);
		else if (dataType === "dynamic") {
			try {
				const data = await getter.callback(search || "");

				setData(data);

				if (search === null && option) {
					const selectedOption = data.find(({ id }) => id === option);

					if (selectedOption) setSearch(selectedOption.search);
				}
			} catch (error) {
				console.error(error);
			}
		}
	};

	useEffect(() => {
		getData();
	}, [search]);

	const displayElement = (() => {
		switch (optionType) {
			case "select":
				const currentItem =
					data && data.find(({ id }) => id === option);
				return (
					<button
						type="button"
						aria-label={ariaLabel}
						onClick={() => setExpanded(!expanded)}
						style={currentItem && { color: "var(--text-color)" }}
						className={!search ? styles["--cms-placeholder"] : null}
					>
						{(currentItem &&
							(currentItem.ariaLabel || currentItem.label)) ||
							ariaLabel}
					</button>
				);
			case "search":
			default:
				return (
					<input
						type="text"
						aria-label={ariaLabel}
						placeholder={ariaLabel}
						value={search || ""}
						onFocus={() => setExpanded(true)}
						onChange={({ target: { value } }) => setSearch(value)}
					/>
				);
		}
	})();

	return (
		<div
			aria-expanded={expanded ? "true" : undefined}
			className={styles["--cms-filter-option"]}
		>
			<span className={styles["--cms-filter-option-input-group"]}>
				<span
					className={
						styles["--cms-filter-option-input-group-display"]
					}
				>
					{displayElement}
				</span>
				<button
					className={`--cms-info ${styles["--cms-filter-option-input-group-display-toggle"]}`}
					type="button"
					aria-label={ariaLabel}
					onClick={() => setExpanded(!expanded)}
				>
					<ChevronDown />
				</button>
			</span>
			{expanded && (
				<div
					className={`--cms-popup-content ${styles["--cms-filter-option-results"]}`}
				>
					<nav className="--cms-popup-nav">
						{data ? (
							data.map((item, index) => (
								<button
									key={index}
									aria-label={item.ariaLabel || item.label}
									aria-selected={
										option === item.id ? "true" : undefined
									}
									className={
										styles[
											"--cms-filter-option-results-item"
										]
									}
									onClick={() => {
										setOption(item.id);
										if (item.search) setSearch(item.search);
										setExpanded(false);
									}}
								>
									{item.label}
								</button>
							))
						) : (
							<Loading color="var(--background-color)" />
						)}
					</nav>
				</div>
			)}
		</div>
	);
};

const Filter = ({
	query,
	setQuery,
	executeQuery,
	disabled,
	sortingOptions,
	filterOptions,
	defaultQuery = {},
}) => {
	// States
	const [filterOptionsOpen, setFilterOptionsOpen] = useState(false);
	const [expandedFilterOption, setExpandedFilterOption] = useState(null);

	// Handlers
	const handleSubmit = (e) => {
		e.preventDefault();

		executeQuery();
	};

	const handleClear = (e) => {
		e.preventDefault();

		setQuery(defaultQuery);
	};

	if (!query)
		return (
			<Message type="error">
				<p>No query attribute passed to Filter component.</p>
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
					>
						<Search />
					</button>
				</span>
				<span>
					{filterOptions && filterOptions.length > 0 && (
						<button
							type="button"
							className={`--cms-info --cms-popup-trigger ${styles["--cms-filter-form-search-tools"]}`}
							aria-label="Search Tools"
							aria-expanded={
								filterOptionsOpen ? "true" : undefined
							}
							onClick={() =>
								setFilterOptionsOpen(!filterOptionsOpen)
							}
						>
							Filter Options <ChevronDown />
						</button>
					)}
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
							{(() => {
								if (query.sort.field === "order")
									return "Order";
								return sortingOptions[query.sort.field].label;
							})()}{" "}
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

			{filterOptions && (
				<section
					aria-expanded={filterOptionsOpen ? "true" : undefined}
					className={styles["--cms-filter-options"]}
				>
					{filterOptions.map((option, index) => {
						return (
							<Option
								key={index}
								index={index}
								option={option}
								{...{
									expanded: expandedFilterOption === index,
									setExpanded: (bool) =>
										bool
											? setExpandedFilterOption(index)
											: setExpandedFilterOption(null),
								}}
							/>
						);
					})}
				</section>
			)}
		</form>
	);
};

export default Filter;
