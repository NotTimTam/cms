import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./index.module.scss";

const Paginate = ({ query, setQuery }) => {
	const { page = 0, numPages = 1 } = query;

	function calculateSpan(min, max, index) {
		// If the max value is less than the number of items we want, adjust accordingly
		let rangeSize = 5;

		// Calculate the start of the range, centered around the index
		let start = Math.max(min, index - 2); // Ensure we don't go below min
		let end = Math.min(max, start + 4); // Ensure we don't go above max

		// If the end is less than the start, adjust to ensure we have 5 numbers
		if (end - start < rangeSize - 1) {
			start = Math.max(min, end - (rangeSize - 1));
		}

		// Generate the range of numbers
		const result = [];
		for (let i = start; i <= start + (rangeSize - 1) && i <= max; i++) {
			result.push(i);
		}

		return result;
	}

	const span = calculateSpan(0, numPages - 1, page);

	return (
		<nav className={styles["--cms-paginate"]}>
			{page > 0 && numPages > 1 && !span.includes(0) && (
				<button
					onClick={() =>
						setQuery((query) => ({
							...query,
							page: 0,
						}))
					}
					aria-label="First"
					className="--cms-highlight"
				>
					<ChevronLeft />
					First
				</button>
			)}
			{span.map((pageButton) =>
				pageButton === page ? (
					<div
						key={pageButton}
						className={styles["--cms-paginate-current-page"]}
					>
						{pageButton + 1}
					</div>
				) : (
					<button
						key={pageButton}
						onClick={() =>
							setQuery((query) => ({
								...query,
								page: pageButton,
							}))
						}
						aria-label={`Page ${pageButton + 1}`}
						className={`--cms-info ${styles["--cms-paginate-page"]}`}
					>
						{pageButton + 1}
					</button>
				)
			)}
			{page < numPages - 1 &&
				numPages > 1 &&
				!span.includes(numPages - 1) && (
					<button
						onClick={() =>
							setQuery((query) => ({
								...query,
								page: numPages - 1,
							}))
						}
						aria-label="Last"
						className="--cms-highlight"
					>
						Last
						<ChevronRight />
					</button>
				)}
		</nav>
	);
};

export default Paginate;
