import AdministratorContextProvider from "./components/AdministratorContext";
import "./index.scss";

export const metadata = {
	title: {
		template: "%s | Administrator",
		default: "Administrator",
	},
};

export default async function AdministratorLayout({ children }) {
	return (
		<AdministratorContextProvider>
			<main className="--cms-administrator">{children}</main>
		</AdministratorContextProvider>
	);
}
