import { getToken } from "@/app/cookies";
import AuthenticatedUserProvider from "@/components/AuthenticatedUserContext";

export const metadata = {
	title: "Dashboard",
};

export default async function DashboardLayout({ children }) {
	const token = await getToken();

	return (
		<AuthenticatedUserProvider
			token={token}
			redirect="/administrator/login"
		>
			<aside className="--cms-menu">
				<h2>CMS</h2>
				<ul>
					<li>Toggle Menu</li>
					<li>Home Dashboard</li>
					<li>
						Content
						<ul>
							<li>Articles</li>
							<li>Modules</li>
						</ul>
					</li>
					<li>Menus</li>
					<li>Components</li>
					<li>Users</li>
					<li>System</li>
					<li>Help</li>
				</ul>
			</aside>
			<header className="--cms-header">
				<section>Home Dashboard</section>

				<section>
					<ul>
						<li>Take a Tour</li>
						<li>Joomla 5 DEMO</li>
						<li>User Menu</li>
					</ul>
				</section>
			</header>
			<article className="--cms-content">{children}</article>
		</AuthenticatedUserProvider>
	);
}
