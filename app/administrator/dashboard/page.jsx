"use client";

import { AuthenticatedUserContext } from "@/components/AuthenticatedUserContext";
import { useContext } from "react";
import styles from "./page.module.scss";

export default function Dashboard() {
	const [user] = useContext(AuthenticatedUserContext);

	return (
		<div className={styles["--cms-dashboard"]}>
			<section className={styles["--cms-dashboard-section"]}>
				<header className={styles["--cms-dashboard-section-header"]}>
					<h2>Site</h2>
				</header>
				<ul>
					<li>Users</li>
					<li>Articles</li>
					<li>Categories</li>
					<li>Media</li>
					<li>Modules</li>
					<li>Plugins</li>
				</ul>
			</section>
			<section className={styles["--cms-dashboard-section"]}>
				<header className={styles["--cms-dashboard-section-header"]}>
					<h2>Site Information</h2>
				</header>
				<ul>
					<li>PHP 8.1.13</li>
					<li>MySQLi 8.0.31</li>
					<li>Something Disabled</li>
				</ul>
			</section>
			<section className={styles["--cms-dashboard-section"]}>
				<header className={styles["--cms-dashboard-section-header"]}>
					<h2>System</h2>
				</header>
				<ul>
					<li>Global Checkin</li>
					<li>Cache</li>
					<li>Global Configuration</li>
				</ul>
			</section>

			<section className={styles["--cms-dashboard-section"]}>
				<header className={styles["--cms-dashboard-section-header"]}>
					<h2>Notification</h2>
				</header>
				<kbd>Display notifications here...</kbd>
			</section>

			<section className={styles["--cms-dashboard-section"]}>
				<header className={styles["--cms-dashboard-section-header"]}>
					<h2>Recently Added Articles</h2>
				</header>
				<kbd>Load articles here...</kbd>
			</section>
		</div>
	);
}
