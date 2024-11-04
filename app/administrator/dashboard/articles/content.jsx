"use client";

import { useState } from "react";
import Filter from "../../components/Filter";
import StorageInterface from "@/util/StorageInterface";
import Message from "../../components/Message";

const Content = () => {
	const SessionStorage = new StorageInterface(window.sessionStorage);
	const {
		data: { articleQuery },
	} = SessionStorage;

	const [query, setQuery] = useState(articleQuery || {});

	const executeQuery = (query) => {
		console.log("MAKING SEARCH");

		try {
		} catch (err) {
			console.error(err.data);
		}
	};

	return (
		<>
			<Filter {...{ disabled: false, query, setQuery, executeQuery }} />
			<div style={{ paddingLeft: 16, paddingRight: 16 }}>
				<Message type="info">
					No articles found with that query.
				</Message>
			</div>
		</>
	);
};

export default Content;
