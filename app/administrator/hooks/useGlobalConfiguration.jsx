"use client";

import { getToken } from "@/app/cookies";
import API from "@/util/API";
import { useEffect, useState } from "react";

export default function useGlobalConfiguration() {
	const [globalConfiguration, setGlobalConfiguration] = useState(null);

	const executeQuery = async () => {
		setGlobalConfiguration(null);

		try {
			// Get roles.
			const token = await getToken();
			const {
				data: { globalConfiguration },
			} = await API.get(
				API.globalConfiguration,
				API.createAuthorizationConfig(token)
			);

			setGlobalConfiguration(globalConfiguration);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		executeQuery();
	}, []);

	return globalConfiguration;
}
