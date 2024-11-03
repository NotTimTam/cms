import { redirect } from "next/navigation";
import { getToken } from "../cookies";

export default async function Administrator() {
	const token = await getToken();

	if (!token) redirect("/administrator/login");
	else redirect("/administrator/dashboard");

	return <h1>Administrator</h1>;
}
