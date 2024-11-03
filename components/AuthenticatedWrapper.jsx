"use client";

import API from "@/util/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthenticatedWrapper({ children, token, redirect }) {
	const router = useRouter();

	const authenticateUser = async () => {
		try {
			const authenticated = await API.authenticate(token);

			console.log(authenticated);
		} catch (err) {
			alert(err.data);
			if (redirect) router.push(redirect);
		}
	};

	useEffect(() => {
		if (token) authenticateUser();
	}, [token]);

	return children;
}
