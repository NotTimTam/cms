"use client";

import { useEffect, useState } from "react";
import Loading from "../../Loading";
import Message from "..";
import API from "@/util/API";
import styles from "./index.module.scss";

const SystemMessages = ({ token, fill }) => {
	const [messages, setMessages] = useState(null);

	const getSystemMessages = async () => {
		setMessages(null);

		try {
			const {
				data: { systemMessages },
			} = await API.get(API.messages);

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

	return (
		<div className={styles["--cms-system-messages"]}>
			{messages ? (
				messages.map((message) => {
					const { _id, content, createdAt, type } = message;

					return (
						<Message fill={fill} key={_id} type={type}>
							<b>{new Date(createdAt).toLocaleString()}</b>{" "}
							&mdash; <span>{content}</span>
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
