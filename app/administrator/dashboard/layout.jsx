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
			{children}
		</AuthenticatedUserProvider>
	);
}
