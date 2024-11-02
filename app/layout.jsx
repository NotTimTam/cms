export const metadata = {
	title: {
		template: "%s | CMS",
		default: "CMS",
	},
	description: "cms description",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
