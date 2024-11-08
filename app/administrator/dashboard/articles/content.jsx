"use client";

import { useSearchParams } from "next/navigation";
import Listings from "./listings";
import Editor from "./editor";

const Content = () => {
	const searchParams = useSearchParams();
	const layout = searchParams.get("layout");
	const id = searchParams.get("id");

	switch (layout) {
		case "edit":
			return <Editor />;
		default:
			return <Listings />;
	}
};

export default Content;
