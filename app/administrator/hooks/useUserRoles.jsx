"use client";

import { getToken } from "@/app/cookies";
import API from "@/util/API";
import { unflattenDocumentTree } from "@/util/display";
import { useEffect, useState } from "react";

export default function useUserRoles(query = {}, setQuery) {
	const [userRoles, setUserRoles] = useState(null);

	const executeQuery = async () => {
		setUserRoles(null);

		try {
			// Create search params.
			const searchParams = API.createQueryString(query);

			// Get roles.
			const token = await getToken();
			const {
				data: { roles, page: newPage, numPages },
			} = await API.get(
				`${API.roles}/tree?${searchParams.toString()}`,
				API.createAuthorizationConfig(token)
			);

			setUserRoles(unflattenDocumentTree(roles));
			setQuery &&
				setQuery((query) => ({
					...query,
					page: newPage,
					numPages,
				}));
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		executeQuery();
	}, [query]);

	return userRoles;
}
