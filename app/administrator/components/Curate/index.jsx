"use client";

import { ChevronDown, CircleHelp, Cog, Ellipsis, Plus } from "lucide-react";
import styles from "./index.module.scss";
import Link from "next/link";

const Curate = ({ handleNew, actions, options = "", help = "" }) => {
	return (
		<header className={styles["--cms-curate"]}>
			<nav className={styles["--cms-curate-nav"]}>
				<section>
					<button
						onClick={handleNew}
						disabled={!handleNew}
						className="--cms-success"
					>
						<Plus /> New
					</button>

					<button disabled={!actions || actions.length === 0}>
						<Ellipsis /> Actions <ChevronDown />
					</button>
				</section>

				<section>
					<Link
						href={options}
						className="--cms-button --cms-highlight"
						disabled={!help}
					>
						<Cog /> Options
					</Link>

					<Link
						href={help}
						className="--cms-button --cms-highlight"
						disabled={!options}
					>
						<CircleHelp /> Help
					</Link>
				</section>
			</nav>
		</header>
	);
};

export default Curate;
