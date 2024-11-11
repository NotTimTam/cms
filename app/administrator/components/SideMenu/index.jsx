"use client";

import { ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import styles from "./index.module.scss";
import { AdministratorContext } from "../AdministratorContext";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getCurrentMenu } from "@/util/display";
import scssVars from "../../scssVars";
import StorageInterface from "@/util/StorageInterface";

const SideMenuSection = ({
	title,
	children,
	index,
	icon,
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
					{icon}
					<span>{title}</span>
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
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const storedSideMenu = SessionStorage.getItem("sideMenu");

	const pathname = usePathname();
	const searchParams = useSearchParams();

	const closeMenuOnClick = window && window.innerWidth <= scssVars.tablet;

	const {
		state: [administrator, setAdministrator],
		menu,
	} = useContext(AdministratorContext);

	const [expanded, setExpanded] = useState(
		storedSideMenu && storedSideMenu.expanded
	);

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

		SessionStorage.setItem("sideMenu", { expanded });
	}, [expanded]);

	const currentMenu = getCurrentMenu(menu, pathname, searchParams);

	const menuMapper = (item, index) => {
		const { type, title, icon, href, content, quickLink } = item;

		if (type === "a")
			return (
				<div key={index} className={styles["--cms-button-group"]}>
					<Link
						className="--cms-button"
						aria-selected={
							currentMenu &&
							(currentMenu.href === item.href ||
								(quickLink &&
									currentMenu.quickLink &&
									quickLink.href ===
										currentMenu.quickLink.href))
								? "true"
								: undefined
						}
						aria-label={title}
						onClick={
							closeMenuOnClick
								? () => setExpanded(false)
								: undefined
						}
						href={href}
					>
						{icon}
						<span>{title}</span>
					</Link>
					{quickLink && (
						<Link
							className={`--cms-button ${styles["--cms-quick-link"]}`}
							aria-label={quickLink.ariaLabel}
							href={quickLink.href}
							onClick={
								closeMenuOnClick
									? () => setExpanded(false)
									: undefined
							}
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
					icon={icon}
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
