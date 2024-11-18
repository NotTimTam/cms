import Message from "../components/Message";

export const metadata = {
	title: "Login",
};

export default async function LoginLayout({ children }) {
	return (
		<>
			<Message.SystemMessages fill />
			<article className="--cms-form-container">{children}</article>
		</>
	);
}
