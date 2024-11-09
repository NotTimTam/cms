"use client";

import { useRouter, useSearchParams } from "next/navigation";

const Groups = () => "Groups";
const Rolls = () => "Rolls";
const Fields = () => "Fields";
const FieldGroups = () => "FieldGroups";
const Manage = () => "Manage";

const Content = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const view = searchParams.get("view");
	const id = searchParams.get("id");

	switch (view) {
		case "groups":
			return <Groups />;
		case "rolls":
			return <Rolls />;
		case "fields":
			return <Fields />;
		case "fieldgroups":
			return <FieldGroups />;
		default:
			return <Manage />;
	}
};

export default Content;
