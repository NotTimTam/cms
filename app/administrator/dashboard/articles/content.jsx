"use client";

import { useSearchParams } from "next/navigation";
import Listings from "./listings";
import ArticleEditor from "./editor";

const Content = () => {
	const searchParams = useSearchParams();
	const layout = searchParams.get("layout");
	const id = searchParams.get("id");

	switch (layout) {
		case "edit":
			return <ArticleEditor id={id} />;
		default:
			return <Listings />;
	}
};

export default Content;
