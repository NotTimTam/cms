"use client";

import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";
import {
	ChevronDown,
	CircleHelp,
	Ellipsis,
	Plus,
	Settings,
} from "lucide-react";
import Link from "next/link";
import { useContext } from "react";

const Curate = ({ new: newHref = "", actions, options = "", help = "" }) => {
	return (
		<nav
			className="--cms-nav --cms-sticky"
			style={{ backgroundColor: "var(--background-color)" }}
		>
			<section>
				<Link
					href={newHref}
					className="--cms-button --cms-success"
					disabled={!newHref}
				>
					<Plus /> New
				</Link>

				<button
					className="--cms-popup-trigger"
					disabled={!actions || actions.length === 0}
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
										{actions.map(
											(
												{ label, ariaLabel, action },
												index
											) => (
												<button
													onClick={async () => {
														action &&
															(await action());
														closePopup();
													}}
													aria-label={ariaLabel}
													key={index}
												>
													{label}
												</button>
											)
										)}
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
					<Ellipsis /> Actions <ChevronDown />
				</button>
			</section>

			<section>
				<Link
					href={options}
					className="--cms-button --cms-highlight"
					disabled={!options}
				>
					<Settings /> Options
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
