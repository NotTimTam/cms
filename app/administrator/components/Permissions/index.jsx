import Message from "../Message";
import { ComponentPermissions, definitions } from "@/util/permissions";
import styles from "./index.module.scss";
import { useState } from "react";
import { isBoolean } from "@/util/data";

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

const Permissions = ({ permissions, configuration = [], setConfiguration }) => {
	if (!permissions)
		throw new Error("No permissions provided to Permissions component.");

	const singleComponentPermissionsObject =
		permissions instanceof ComponentPermissions;

	const [active, setActive] = useState(
		singleComponentPermissionsObject ? null : Object.keys(permissions)[0]
	);

	const getPermissionConfiguration = (permission) => {
		const config = singleComponentPermissionsObject
			? configuration
			: configuration.find(({ name }) => name === active);

		return (
			config && config.permissions.find(({ name }) => name === permission)
		);
	};

	const setPermissionConfiguration = (permission, status) => {
		const exists = getPermissionConfiguration(permission);

		let newConfigurationArray;

		if (singleComponentPermissionsObject)
			newConfigurationArray = configuration;
		else {
			const config = configuration.find(
				({ name }) => name === active
			) || { permissions: [] };

			newConfigurationArray = config.permissions;
		}

		if (!exists)
			newConfigurationArray.push({
				name: permission,
				status: status,
			});
		else {
			const index = newConfigurationArray.indexOf(exists);

			if (index === -1)
				throw new Error(
					"That permission was not found in the configuration."
				);

			newConfigurationArray[index] = {
				...newConfigurationArray[index],
				status,
			};
		}

		if (singleComponentPermissionsObject)
			setConfiguration(newConfigurationArray);
		else {
			const config = configuration.find(({ name }) => name === active);

			const index = config ? configuration.indexOf(config) : -1;

			let newConfiguration = [...configuration];

			newConfiguration[index] = {
				...(config || { name: active }),
				permissions: newConfigurationArray,
			};

			setConfiguration(newConfiguration);
		}
	};

	const mapPermissions = (permissions) =>
		permissions.map((action, index) => {
			const definition = definitions[action];

			if (!definition) return null;

			const { name, description } = definition;

			const value = getPermissionConfiguration(action);

			return (
				<tr key={index}>
					<td title={description}>{name}</td>
					<td>
						<PermissionSelect
							value={value}
							setValue={(value) =>
								setPermissionConfiguration(action, value)
							}
						/>
					</td>
					<td>
						<Message
							type={(() => {
								switch (value) {
									case true:
										return "success";
									case false:
										return "error";
									case null:
									default:
										return "";
								}
							})()}
							fill={isBoolean(value)}
						>
							<p>
								{(() => {
									switch (value) {
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
						{Object.entries(permissions).map(
							([component, { label }], index) => (
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
									{label}
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
						? mapPermissions(permissions.definitions)
						: permissions[active] &&
						  mapPermissions(permissions[active].definitions)}
				</tbody>
			</table>
		</fieldset>
	);
};

export default Permissions;
