import AdministratorContextProvider from "./components/AdministratorContext";
import "./index.scss";

import { Nunito } from "next/font/google";

const nunito = Nunito({
	weight: "variable",
	subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "vietnamese"],
});

export const metadata = {
	title: {
		template: "%s | Administrator",
		default: "Administrator",
	},
};

export default async function AdministratorLayout({ children }) {
	return (
		<AdministratorContextProvider>
			<main className={`${nunito.className} --cms-administrator`}>
				{children}
			</main>
		</AdministratorContextProvider>
	);
}
