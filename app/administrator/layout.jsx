import "./index.scss";

export const metadata = {
	title: {
		template: "%s | Administrator",
		default: "Administrator",
	},
};

export default async function AdministratorLayout({ children }) {
	return children;
}
