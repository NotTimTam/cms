"use client";

import { setToken } from "@/app/cookies";
import API from "@/util/API";
import { emailRegex } from "@/util/regex";
import { Lock, LogIn, User } from "lucide-react";
import { useState } from "react";
import Message from "../components/Message";

export default function Login() {
	const [message, setMessage] = useState(null);
	const [loading, setLoading] = useState(false);

	return (
		<form
			className="--cms-form"
			disabled={loading}
			onSubmit={async (e) => {
				e.preventDefault();

				setMessage(null);
				setLoading(true);

				try {
					const {
						username: { value: username },
						password: { value: password },
					} = e.target;

					const isEmail = emailRegex.test(username);

					const loginBody = { password };
					if (isEmail) loginBody.email = username;
					else loginBody.username = username;

					const {
						data: { token },
					} = await API.post(
						API.createRouteURL(API.users, "auth"),
						loginBody
					);

					setToken(token, "/administrator");
				} catch (error) {
					console.error(error.data);

					setMessage(
						<Message type="error">
							<p>{error.data}</p>
						</Message>
					);
				}

				setLoading(false);
			}}
		>
			<h1>Login</h1>

			<label required htmlFor="username">
				<User /> Username or Email Address
			</label>
			<input
				type="text"
				name="username"
				id="username"
				autoComplete="username"
				required
			/>

			<label required htmlFor="password">
				<Lock /> Password
			</label>
			<input
				type="password"
				name="password"
				id="password"
				autoComplete="current-password"
				required
			/>

			<button type="submit" className="--cms-highlight">
				<LogIn /> Login
			</button>

			{message}
		</form>
	);
}
