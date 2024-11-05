export const metadata = {
	title: "No Title Defined",
	description: "No Description Defined",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
