"use client";

import { useContext } from "react";
import { AdministratorContext } from "../AdministratorContext";
import { usePathname } from "next/navigation";
import styles from "./index.module.scss";
import Link from "next/link";
import { ChevronDown, CodeSquare, Github, UserCircle } from "lucide-react";

const Header = () => {
	const pathname = usePathname();

	const { menu } = useContext(AdministratorContext);

	const menuFinder = ({ href, content }) =>
		href ? href === pathname : content ? content.find(menuFinder) : null;

	const currentMenu = menu.find(menuFinder);

	console.log(currentMenu);

	return (
		<header className={styles["--cms-header"]}>
			<h1 className={styles["--cms-header-title"]}>
				{currentMenu && currentMenu.label}
			</h1>

			<nav className={styles["--cms-header-nav"]}>
				<Link
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.github.com/NotTimTam/cms"
				>
					<CodeSquare />
					Source
				</Link>

				<button>
					<UserCircle />
					User Menu <ChevronDown />
				</button>
			</nav>
		</header>
	);
};

export default Header;
