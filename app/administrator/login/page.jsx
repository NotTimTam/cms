"use client";

export default function Login() {
	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
			}}
		>
			<h1>Login</h1>

			<label htmlFor="username">Username</label>
			<input
				type="text"
				name="username"
				id="username"
				autoComplete="username"
			/>

			<label htmlFor="password">Password</label>
			<input
				type="password"
				name="password"
				id="password"
				autoComplete="current-password"
			/>

			<button type="submit">Submit</button>
		</form>
	);
}
