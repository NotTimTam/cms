"use client";

import { getToken } from "@/app/cookies";
import API from "@/util/API";
import { unflattenDocumentTree } from "@/util/display";
import { useEffect, useState } from "react";

export default function useUserRoles() {
	const [userRoles, setUserRoles] = useState(null);

	const executeQuery = async () => {
		setUserRoles(null);

		try {
			// Get roles.
			const token = await getToken();
			const {
				data: { roles },
			} = await API.get(
				`${API.roles}/tree?itemsPerPage=all&sortDir=1&sortField=order`,
				API.createAuthorizationConfig(token)
			);

			setUserRoles(roles);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		executeQuery();
	}, []);

	return userRoles;
}
