"use client";

import { useContext, useEffect } from "react";
import { AuthenticatedUserContext } from "./AuthenticatedUserContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const VerificationBoundary = ({
	children,
	redirect = "/administrator/dashboard/users?layout=edit&id=${id}",
}) => {
	const router = useRouter();
	const pathName = usePathname();
	const searchParams = useSearchParams();
	const user = useContext(AuthenticatedUserContext);

	const protectRoute = () => {
		if (user.verified) return;

		const truePath = pathName + "?" + searchParams.toString();
		redirect = redirect.replace("${id}", user._id);

		if (truePath !== redirect) router.push(redirect);
	};

	useEffect(() => {
		protectRoute();
	}, [user, pathName]);

	return children;
};

export default VerificationBoundary;
