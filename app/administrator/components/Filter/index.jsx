"use client";

import { ChevronDown, Search } from "lucide-react";
import styles from "./index.module.scss";
import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";
import { useContext } from "react";

const Filter = ({ query, setQuery, executeQuery, disabled }) => {
	// Handlers
	const handleSubmit = (e) => {
		e.preventDefault();

		executeQuery(query);
	};

	const handleClear = (e) => {
		e.preventDefault();

		setQuery({});

		executeQuery({});
	};

	return (
		<form
			disabled={disabled}
			onSubmit={handleSubmit}
			className={`--cms-form ${styles["--cms-filter-form"]}`}
		>
			<section>
				<input
					disabled={disabled}
					type="text"
					placeholder="Search"
					aria-placeholder="Search"
					aria-autocomplete="none"
					autoComplete="off"
					value={query.search || ""}
					onChange={({ target: { value } }) =>
						setQuery({ ...query, search: value })
					}
				/>
				<button disabled={disabled} type="submit" aria-label="Search">
					<Search />
				</button>
				<button
					disabled={disabled}
					type="button"
					className={styles["--cms-filter-form-search-tools"]}
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
									<ul>
										<li>Category</li>
										<li>Tag</li>
										<li>Author</li>
									</ul>
								</div>
							);
						};

						const res = await createHeadlessPopup(
							<PopupContent />,
							[rect.x, rect.bottom]
						);
					}}
				>
					Search Tools <ChevronDown />
				</button>
				<button
					disabled={disabled}
					onClick={handleClear}
					type="reset"
					aria-label="Clear Search"
				>
					Clear
				</button>
			</section>

			<section>
				<button
					disabled={disabled}
					type="button"
					aria-label="Sort By"
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
					}}
				>
					Sort By <ChevronDown />
				</button>
				<button
					disabled={disabled}
					type="button"
					aria-label="Items Per Page"
					onClick={async (e) => {
						const rect = e.target.getBoundingClientRect();

						const PopupContent = () => {
							const closePopup = useContext(PopupContext);

							return (
								<div
									className="--cms-popup-content"
									style={{ minWidth: rect.width }}
								>
									<ul>
										<li>Category</li>
										<li>Tag</li>
										<li>Author</li>
									</ul>
								</div>
							);
						};

						const res = await createHeadlessPopup(
							<PopupContent />,
							[rect.x, rect.bottom]
						);
					}}
				>
					Items Per Page <ChevronDown />
				</button>
			</section>
		</form>
	);
};

export default Filter;
