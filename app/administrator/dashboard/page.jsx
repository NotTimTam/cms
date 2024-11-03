"use client";

import { deleteToken } from "@/app/cookies";
import { AuthenticatedUserContext } from "@/components/AuthenticatedUserContext";
import { useContext } from "react";

export default function Dashboard() {
	const [user] = useContext(AuthenticatedUserContext);

	return (
		<>
			<h1>Dashboard</h1>
			<p>Current user:</p>
			<ul>
				<li>
					<b>Name:</b> {user.name}
				</li>
				<li>
					<b>Username:</b> {user.username}
				</li>
			</ul>
			<button
				type="button"
				onClick={() => deleteToken("/administrator/login")}
			>
				Logout
			</button>
		</>
	);
}
