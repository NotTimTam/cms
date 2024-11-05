"use client";

import { useSearchParams } from "next/navigation";
import Listings from "./listings";
import Editor from "./editor";

const Content = () => {
	const searchParams = useSearchParams();
	const view = searchParams.get("view");
	const id = searchParams.get("id");

	switch (view) {
		case "edit":
			return <Editor id={id} />;
		default:
			return <Listings />;
	}
};

export default Content;
