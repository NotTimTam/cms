"use client";

import API from "@/util/API";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import Loading from "../app/administrator/components/Loading";

/**
 * A React context that providers the current logged-in user.
 * @returns {Object[]} `[user, setUser]`
 */
export const AuthenticatedUserContext = createContext(null);

export default function AuthenticatedUserProvider({
	children,
	token,
	redirect,
}) {
	const router = useRouter();
	const [user, setUser] = useState(null);

	const authenticateUser = async () => {
		try {
			if (!token) throw new Error("No token in current context.");

			const authenticated = await API.authenticate(token);

			if (!authenticated) throw new Error("User is not authenticated!");

			setUser(authenticated.user);
		} catch (error) {
			console.error(error);
			if (redirect) router.push(redirect);
		}
	};

	useEffect(() => {
		authenticateUser();
	}, [token]);

	if (!user) return <Loading />;

	return (
		<AuthenticatedUserContext.Provider value={[user, setUser]}>
			{children}
		</AuthenticatedUserContext.Provider>
	);
}
