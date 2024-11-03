import { getToken } from "@/app/cookies";
import AuthenticatedUserProvider from "@/components/AuthenticatedUserContext";
import SideMenu from "../components/SideMenu";

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
			<div className="--cms-dashboard">
				<SideMenu />
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
			</div>
		</AuthenticatedUserProvider>
	);
}
