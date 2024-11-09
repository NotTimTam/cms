"use client";

import { ChevronRight, Library, ToggleLeft, ToggleRight } from "lucide-react";
import { useContext, useEffect } from "react";
import styles from "./index.module.scss";
import { AdministratorContext } from "../AdministratorContext";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getCurrentMenu } from "@/util/display";

const SideMenuSection = ({
	label,
	title,
	children,
	index,
	sections,
	setSections,
	expandMenu,
}) => {
	return (
		<section
			aria-expanded={sections[index] ? "true" : undefined}
			className={styles["--cms-menu-section"]}
		>
			<header className={styles["--cms-menu-section-header"]}>
				<button
					aria-label={title}
					type="button"
					onClick={() => {
						setSections({
							...sections,
							[index]: sections.hasOwnProperty(index)
								? !sections[index]
								: true,
						});
						expandMenu();
					}}
				>
					{label}
					<ChevronRight
						className={
							styles["--cms-menu-section-toggle-indicator"]
						}
					/>
				</button>
			</header>
			<div className={styles["--cms-menu-section-content"]}>
				{children}
			</div>
		</section>
	);
};

const SideMenu = () => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const {
		state: [administrator, setAdministrator],
		menu,
	} = useContext(AdministratorContext);

	const [expanded, setExpanded] = [
		administrator.sideMenu.expanded,
		(expanded) =>
			setAdministrator((administrator) => ({
				...administrator,
				sideMenu: { ...administrator.sideMenu, expanded },
			})),
	];

	const [sections, setSections] = [
		administrator.sideMenu.sections,
		(sections) =>
			setAdministrator((administrator) => ({
				...administrator,
				sideMenu: { ...administrator.sideMenu, sections },
			})),
	];

	useEffect(() => {
		if (!expanded) setSections({});
	}, [expanded]);

	const currentMenu = getCurrentMenu(menu, pathname, searchParams);

	const menuMapper = (item, index) => {
		const { type, title, label, href, content, quickLink } = item;

		if (type === "a")
			return (
				<div key={index} className={styles["--cms-button-group"]}>
					<Link
						className="--cms-button"
						aria-selected={
							currentMenu.href === item.href ||
							(quickLink &&
								currentMenu.quickLink &&
								quickLink.href === currentMenu.quickLink.href)
								? "true"
								: undefined
						}
						aria-label={title}
						href={href}
					>
						{label}
					</Link>
					{quickLink && (
						<Link
							className={`--cms-button ${styles["--cms-quick-link"]}`}
							aria-label={quickLink.ariaLabel}
							href={quickLink.href}
						>
							<span>{quickLink.icon}</span>
						</Link>
					)}
				</div>
			);
		else if (type === "s")
			return (
				<SideMenuSection
					key={index}
					sections={sections}
					setSections={setSections}
					expandMenu={() => setExpanded(true)}
					index={index}
					label={label}
					title={title}
				>
					{content && content.map(menuMapper)}
				</SideMenuSection>
			);
		else if (type === "d") return <hr key={index} />;
	};

	return (
		<aside
			className={styles["--cms-menu"]}
			aria-expanded={expanded ? "true" : undefined}
		>
			<header className={styles["--cms-menu-header"]}>
				<h2>
					<Library />
					<span>Administrator</span>
				</h2>

				<button
					onClick={() => setExpanded(!expanded)}
					type="button"
					className={styles["--cms-menu-toggle"]}
					aria-label="Toggle Menu"
				>
					{expanded ? <ToggleRight /> : <ToggleLeft />}
					<span>Toggle Menu</span>
				</button>
			</header>

			<nav
				className={styles["--cms-menu-nav"]}
				aria-label="Dashboard Navigation"
			>
				{menu.map(menuMapper)}
			</nav>
		</aside>
	);
};

export default SideMenu;
