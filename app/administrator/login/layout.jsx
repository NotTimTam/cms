import SystemMessages from "../components/SystemMessages";

export const metadata = {
	title: "Login",
};

export default async function LoginLayout({ children }) {
	return (
		<>
			<SystemMessages fill />
			<article className="--cms-form-container">{children}</article>
		</>
	);
}
