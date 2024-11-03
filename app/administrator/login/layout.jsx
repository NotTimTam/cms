import { getToken } from "@/app/cookies";
import { redirect } from "next/navigation";

export const metadata = {
	title: "Login",
};

export default async function LoginLayout({ children }) {
	const token = await getToken();

	if (token) redirect("/administrator/dashboard");

	return children;
}
