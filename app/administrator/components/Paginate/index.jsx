import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./index.module.scss";

const Paginate = ({ query, setQuery }) => {
	const { page = 0, numPages = 1 } = query;

	const span = [page - 1, page, page + 1, page + 2, page + 3].filter(
		(f) => f >= 0 && f <= numPages - 1
	);

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
