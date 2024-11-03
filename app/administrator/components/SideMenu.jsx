"use client";

import { ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

const SideMenu = () => {
	const [toggle, setToggle] = useState(false);

	return (
		<aside className="--cms-menu">
			<h2>CMS</h2>

			<button
				onClick={() => setToggle(!toggle)}
				type="button"
				className="--cms-menu-toggle"
			>
				{toggle ? <ToggleRight /> : <ToggleLeft />}
				{toggle && "Toggle Menu"}
			</button>

			<ul>
				<li>Home Dashboard</li>
				<li>
					Content
					<ul>
						<li>Articles</li>
						<li>Modules</li>
					</ul>
				</li>
				<li>Menus</li>
				<li>Components</li>
				<li>Users</li>
				<li>System</li>
				<li>Help</li>
			</ul>
		</aside>
	);
};

export default SideMenu;
