"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import Message from "../Message";
import API from "@/util/API";
import styles from "./index.module.scss";

const SystemMessages = ({ token, fill, style = {} }) => {
	const [messages, setMessages] = useState(null);

	const getSystemMessages = async () => {
		setMessages(null);

		try {
			const {
				data: { systemMessages },
			} = await API.get(
				token
					? API.createRouteURL(API.messages, "confidential")
					: API.messages,
				token ? API.createAuthorizationConfig(token) : undefined
			);

			setMessages(systemMessages);
		} catch (error) {
			console.error(error.data);

			setMessages([
				{
					type: "error",
					content: error.data,
					_id: "0",
					createdAt: new Date().toISOString(),
				},
			]);
		}
	};

	useEffect(() => {
		getSystemMessages();
	}, []);

	if (messages && messages.length === 0) return null;

	return (
		<div style={style} className={styles["--cms-system-messages"]}>
			{messages ? (
				messages.map((message, key) => {
					const { content, type } = message;

					return (
						<Message fill={fill} key={key} type={type}>
							<span>{content}</span>
						</Message>
					);
				})
			) : (
				<Loading />
			)}
		</div>
	);
};

export default SystemMessages;
