import { getToken } from "@/app/cookies";
import AuthenticatedUserProvider from "@/components/AuthenticatedUserContext";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";

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
				<Header />
				<article className="--cms-content">{children}</article>
			</div>
		</AuthenticatedUserProvider>
	);
}
