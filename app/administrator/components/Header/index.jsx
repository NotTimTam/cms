"use client";

import { useContext } from "react";
import { AdministratorContext } from "../AdministratorContext";
import { usePathname, useSearchParams } from "next/navigation";
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
import { getCurrentMenu } from "@/util/display";
import { AuthenticatedUserContext } from "@/components/AuthenticatedUserContext";

const Header = () => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const { menu } = useContext(AdministratorContext);
	const user = useContext(AuthenticatedUserContext);

	const activeMenu = getCurrentMenu(menu, pathname, searchParams);

	return (
		<header className={styles["--cms-header"]}>
			<h1 className={styles["--cms-header-title"]}>
				{activeMenu && (
					<>
						{activeMenu.icon}
						{activeMenu.alt || activeMenu.title}
					</>
				)}
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
					type="button"
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
											href={`/administrator/dashboard/users?layout=edit&id=${user._id}`}
										>
											<FileUser /> My Profile
										</Link>

										<button
											type="button"
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
					{(user && user.name) || "User Menu"} <ChevronDown />
				</button>
			</nav>
		</header>
	);
};

export default Header;
