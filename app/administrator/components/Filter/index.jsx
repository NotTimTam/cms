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
		readOnly,
		state: [option, setOption],
		getter,
		getter: { type },
	},
}) => {
	const [data, setData] = useState(null);
	const [search, setSearch] = useState("");
	const [open, setOpen] = useState(false);

	const getData = async () => {
		if (type === "static") setData(getter.data);
		else if (type === "dynamic") {
			try {
				const data = await getter.callback(search);

				setData(data);
			} catch (error) {
				console.error(error);
			}
		}
	};

	useEffect(() => {
		getData();
	}, [search]);

	return (
		<div
			aria-expanded={open ? "true" : undefined}
			className={styles["--cms-filter-option"]}
		>
			<span className={styles["--cms-filter-option-input-group"]}>
				<input
					type="text"
					aria-label={ariaLabel}
					placeholder={ariaLabel}
					readOnly={readOnly}
					value={search}
					onFocus={() => setOpen(true)}
					onChange={({ target: { value } }) => setSearch(value)}
				/>
				<button
					className="--cms-info"
					type="button"
					aria-label={ariaLabel}
					onClick={() => setOpen(!open)}
				>
					<ChevronDown />
				</button>
			</span>
			{open && (
				<div
					className={`--cms-popup-content ${styles["--cms-filter-option-results"]}`}
				>
					<nav className="--cms-popup-nav">
						{data ? (
							data.map((item, index) => (
								<button
									key={index}
									aria-label={item.label}
									aria-selected={
										option === item.id ? "true" : undefined
									}
									onClick={() => {
										setOption(item.id);
										if (item.search) setSearch(item.search);
										setOpen(false);
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

			{filterOptionsOpen && (
				<section className={styles["--cms-filter-options"]}>
					{filterOptions.map((option, index) => {
						return (
							<Option key={index} index={index} option={option} />
						);
					})}
				</section>
			)}
		</form>
	);
};

export default Filter;
