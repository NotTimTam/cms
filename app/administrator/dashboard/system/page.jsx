import Link from "next/link";

export const metadata = {
	title: "System Overview",
};

export default function SystemOverview() {
	return (
		<Link href="/administrator/dashboard/system/global">
			Global Configuration
		</Link>
	);
}
