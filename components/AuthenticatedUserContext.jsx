"use client";

import API from "@/util/api";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import Loading from "./Loading";

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
			const authenticated = await API.authenticate(token);

			if (!authenticated) throw new Error("User is not authenticated!");

			setUser(authenticated.user);
		} catch (err) {
			alert(err.data);
			if (redirect) router.push(redirect);
		}
	};

	useEffect(() => {
		if (token) authenticateUser();
	}, [token]);

	if (!user) return <Loading />;

	return (
		<AuthenticatedUserContext.Provider value={[user, setUser]}>
			{children}
		</AuthenticatedUserContext.Provider>
	);
}
