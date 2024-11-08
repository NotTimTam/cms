"use client";

import { useContext } from "react";
import { AdministratorContext } from "../AdministratorContext";
import { usePathname } from "next/navigation";
import styles from "./index.module.scss";
import Link from "next/link";
import {
	ChevronDown,
	CodeSquare,
	FileUser,
	LogOut,
	UserCircle,
} from "lucide-react";
import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";
import { deleteToken } from "@/app/cookies";

const Header = () => {
	const pathname = usePathname();

	const { menu } = useContext(AdministratorContext);

	const findMenuMapper = (menu) => {
		const { href, content } = menu;
		if (href && href === pathname) return menu;
		else if (content) return content.map(findMenuMapper);
	};

	const currentMenu = (menu
		.map(findMenuMapper)
		.flat()
		.filter((menu) => menu) || [])[0];

	return (
		<header className={styles["--cms-header"]}>
			<h1 className={styles["--cms-header-title"]}>
				{currentMenu && currentMenu.label}
			</h1>

			<nav className={styles["--cms-header-nav"]}>
				<Link
					className="--cms-button"
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.github.com/NotTimTam/cms"
				>
					<CodeSquare />
					Source
				</Link>

				<button
					onClick={async (e) => {
						const rect = e.target.getBoundingClientRect();

						const PopupContent = () => {
							const closePopup = useContext(PopupContext);

							return (
								<div className="--cms-popup-content">
									<nav
										style={{ minWidth: rect.width }}
										className="--cms-popup-nav"
									>
										<Link
											aria-label="My Profile"
											className="--cms-button"
											href="/administrator/dashboard/users?layout=edit&id=me"
										>
											<FileUser /> My Profile
										</Link>

										<button
											aria-label="Logout"
											onClick={() => {
												closePopup();
												deleteToken(
													"/administrator/login"
												);
											}}
										>
											<LogOut /> Logout
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
					<UserCircle />
					User Menu <ChevronDown />
				</button>
			</nav>
		</header>
	);
};

export default Header;
