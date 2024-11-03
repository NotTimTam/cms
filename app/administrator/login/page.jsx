"use client";

import { setToken } from "@/app/cookies";
import API from "@/util/api";
import { emailRegex } from "@/util/regex";

export default function Login() {
	return (
		<form
			className="--cms-form"
			onSubmit={async (e) => {
				e.preventDefault();

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
					alert(error.data);
					console.error(error.data);
				}
			}}
		>
			<h1>Login</h1>

			<label required htmlFor="username">
				Username or Email Address
			</label>
			<input
				type="text"
				name="username"
				id="username"
				autoComplete="username"
				required
			/>

			<label required htmlFor="password">
				Password
			</label>
			<input
				type="password"
				name="password"
				id="password"
				autoComplete="current-password"
				required
			/>

			<button type="submit">Submit</button>
		</form>
	);
}
