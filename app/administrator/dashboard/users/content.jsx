"use client";

import { useSearchParams } from "next/navigation";
import RoleEditor from "./roles/editor";
import RoleListings from "./roles/listings";
import UserEditor from "./editor";
import UserListings from "./listings";

const Fields = () => "Fields";
const FieldGroups = () => "FieldGroups";

const Content = () => {
	const searchParams = useSearchParams();
	const view = searchParams.get("view");
	const layout = searchParams.get("layout");
	const id = searchParams.get("id");

	switch (view) {
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
			switch (layout) {
				case "edit":
					return <UserEditor id={id} />;
				default:
					return <UserListings />;
			}
	}
};

export default Content;
