"use client";

import { useSearchParams } from "next/navigation";
import RoleEditor from "./roles/editor";
import RoleListings from "./roles/listings";

const Groups = () => "Groups";
const Fields = () => "Fields";
const FieldGroups = () => "FieldGroups";
const Manage = () => "Manage";

const Content = () => {
	const searchParams = useSearchParams();
	const view = searchParams.get("view");
	const layout = searchParams.get("layout");
	const id = searchParams.get("id");

	switch (view) {
		case "groups":
			return <Groups />;
		case "roles":
			switch (layout) {
				case "edit":
					return <RoleEditor id={id} />;
				default:
					return <RoleListings />;
			}
		case "fields":
			return <Fields />;
		case "fieldgroups":
			return <FieldGroups />;
		default:
			return <Manage />;
	}
};

export default Content;