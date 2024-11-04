"use client";

import { useState } from "react";
import Filter from "../../components/Filter";
import StorageInterface from "@/util/StorageInterface";

const Content = () => {
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { articleQuery },
	} = SessionStorage;

	const [query, setQuery] = useState(articleQuery || {});

	const executeQuery = (query) => {
		console.log("MAKING SEARCH");
	};

	return (
		<>
			<Filter {...{ disabled: false, query, setQuery, executeQuery }} />
			List articles here...
		</>
	);
};

export default Content;
