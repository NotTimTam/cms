import Link from "next/link";
import styles from "./page.module.scss";
import nodePackage from "@/package.json" assert { type: "json" };
import { getToken } from "@/app/cookies";
import SystemMessages from "../components/SystemMessages";

export default async function Dashboard() {
	const token = await getToken();

	return (
		<div className={styles["--cms-dashboard"]}>
			<SystemMessages token={token} />
			<section className={styles["--cms-dashboard-section"]}>
				<header className={styles["--cms-dashboard-section-header"]}>
					<h2>Site</h2>
				</header>
				<nav>
					<ul>
						<li>
							<Link href="/administrator/dashboard/users">
								Users
							</Link>
						</li>
						<li>
							<Link href="/administrator/dashboard/articles">
								Articles
							</Link>
						</li>
						<li>
							<Link href="/administrator/dashboard/categories">
								Categories
							</Link>
						</li>
						<li>
							<Link href="/administrator/dashboard/media">
								Media
							</Link>
						</li>
						<li>
							<Link href="/administrator/dashboard/modules">
								Modules
							</Link>
						</li>
						<li>
							<Link href="/administrator/dashboard/plugins">
								Plugins
							</Link>
						</li>
					</ul>
				</nav>
			</section>
			<section className={styles["--cms-dashboard-section"]}>
				<header className={styles["--cms-dashboard-section-header"]}>
					<h2>Site Information</h2>
				</header>
				<p>Dependencies:</p>
				<ul>
					<li>
						<b>CMS</b> {nodePackage.version}
					</li>
					<li>
						<b>Express</b> {nodePackage.dependencies.express}
					</li>
					<li>
						<b>Mongoose</b> {nodePackage.dependencies.mongoose}
					</li>
					<li>
						<b>React</b> {nodePackage.dependencies.react}
					</li>
					<li>
						<b>Next.js</b> {nodePackage.dependencies.next}
					</li>
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
