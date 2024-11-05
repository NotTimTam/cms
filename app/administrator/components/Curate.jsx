"use client";

import { ChevronDown, CircleHelp, Cog, Ellipsis, Plus } from "lucide-react";
import Link from "next/link";

const Curate = ({ new: newHref = "", actions, options = "", help = "" }) => {
	return (
		<nav className="--cms-nav">
			<section>
				<Link
					href={newHref}
					className="--cms-button --cms-success"
					disabled={!newHref}
				>
					<Plus /> New
				</Link>

				<button disabled={!actions || actions.length === 0}>
					<Ellipsis /> Actions <ChevronDown />
				</button>
			</section>

			<section>
				<Link
					href={options}
					className="--cms-button --cms-highlight"
					disabled={!options}
				>
					<Cog /> Options
				</Link>

				<Link
					href={help}
					className="--cms-button --cms-highlight"
					disabled={!help}
				>
					<CircleHelp /> Help
				</Link>
			</section>
		</nav>
	);
};

export default Curate;
