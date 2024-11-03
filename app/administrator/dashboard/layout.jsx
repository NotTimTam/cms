import { getToken } from "@/app/cookies";
import AuthenticatedWrapper from "@/components/AuthenticatedWrapper";

export default async function DashboardLayout({ children }) {
	const token = await getToken();

	return (
		<AuthenticatedWrapper token={token} redirect="/administrator/login">
			{children}
		</AuthenticatedWrapper>
	);
}
