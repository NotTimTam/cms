import Message from "../Message";
import { ComponentPermissions, definitions } from "@/util/permissions";
import styles from "./index.module.scss";
import { useState } from "react";

const PermissionSelect = ({ value, setValue }) => {
	return (
		<select
			value={(() => {
				switch (value) {
					case true:
						return "allowed";
					case false:
						return "denied";
					case null:
					default:
						return "inherited";
				}
			})()}
			onChange={({ target: { value } }) =>
				setValue(
					(() => {
						switch (value) {
							case "allowed":
								return true;
							case "denied":
								return false;
							case "inherited":
							default:
								return null;
						}
					})()
				)
			}
		>
			<option value="inherited">Inherited</option>
			<option value="denied">Denied</option>
			<option value="allowed">Allowed</option>
		</select>
	);
};

const Permissions = ({ actions, permissions = {}, setPermissions }) => {
	if (!actions)
		throw new Error("No actions provided to Permissions component.");

	const singleComponentPermissionsObject =
		actions instanceof ComponentPermissions;

	const [active, setActive] = useState(
		singleComponentPermissionsObject ? null : Object.keys(actions)[0]
	);

	const mapActions = (actions) =>
		actions.map((action, index) => {
			const definition = definitions[action];

			if (!definition) return null;

			const { name, description } = definition;

			return (
				<tr key={index}>
					<td title={description}>{name}</td>
					<td>
						<PermissionSelect
							value={permissions[action]}
							setValue={(value) =>
								setPermissions({
									...permissions,
									[action]: value,
								})
							}
						/>
					</td>
					<td>
						<Message
							type={(() => {
								switch (permissions[action]) {
									case true:
										return "success";
									case false:
										return "error";
									case null:
									default:
										return "info";
								}
							})()}
							fill
						>
							<p>
								{(() => {
									switch (permissions[action]) {
										case true:
											return "Allowed";
										case false:
											return "Not Allowed";
										case null:
										default:
											return "<Loading> (Inherited)";
									}
								})()}
							</p>
						</Message>
					</td>
				</tr>
			);
		});

	return (
		<fieldset className={styles["--cms-permissions-fieldset"]}>
			<legend>Permissions</legend>

			{!singleComponentPermissionsObject && (
				<aside className={styles["--cms-permissions-aside"]}>
					<nav>
						{Object.entries(actions).map(
							([component, { name }], index) => (
								<button
									aria-selected={
										active === component
											? "true"
											: undefined
									}
									className="--cms-link"
									key={index}
									onClick={() => setActive(component)}
								>
									{name}
								</button>
							)
						)}
					</nav>
				</aside>
			)}

			<table className={styles["--cms-permissions-table"]}>
				<thead>
					<tr>
						<th>Action</th>
						<th>Select New Setting</th>
						<th>Calculated Setting</th>
					</tr>
				</thead>
				<tbody>
					{singleComponentPermissionsObject
						? mapActions(actions.definitions)
						: actions[active] &&
						  mapActions(actions[active].definitions)}
				</tbody>
			</table>
		</fieldset>
	);
};

export default Permissions;
