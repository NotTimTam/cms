import Message from "../Message";
import { definitions } from "@/util/permissions";
import styles from "./index.module.scss";
import { isBoolean } from "@/util/data";
import { capitalizeWords } from "@/util/display";
import { useState } from "react";
import Nav from "../Nav";

export const Permission = ({
	permission: { name, description },
	inherited,
	value,
	setValue,
	hideInheritance = false,
}) => {
	const valueToString = (value) => {
		switch (value) {
			case true:
				return "allowed";
			case false:
				return "denied";
			case null:
			default:
				return "inherited";
		}
	};

	const stringToValue = (string) => {
		switch (string) {
			case "allowed":
				return true;
			case "denied":
				return false;
			case "inherited":
			default:
				return null;
		}
	};

	return (
		<tr>
			<td title={description}>{name}</td>
			<td>
				<select
					value={valueToString(value)}
					onChange={({ target: { value } }) =>
						setValue(stringToValue(value))
					}
				>
					<option value="inherited">
						{hideInheritance ? "Undefined" : "Inherited"}
					</option>
					<option value="denied">Denied</option>
					<option value="allowed">Allowed</option>
				</select>
			</td>
			{!hideInheritance && (
				<td>
					<Message
						type={(() => {
							const valueToMessageType = (value) => {
								switch (value) {
									case true:
										return "success";
									case false:
										return "error";
									case null:
									default:
										return "";
								}
							};
							if (isBoolean(value))
								return valueToMessageType(value);
							else return valueToMessageType(inherited);
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
										return "Inherited";
									default:
										return `${capitalizeWords(
											valueToString(inherited)
										)} (Inherited)`;
								}
							})()}
						</p>
					</Message>
				</td>
			)}
		</tr>
	);
};

export const Permissions = ({
	definitions: targetDefinitions,
	permissions = [],
	setPermissions,
	inheritance,
	hideInheritance = false,
}) => {
	return (
		<table className={styles["--cms-permissions-table"]}>
			<thead>
				<tr>
					<th>Action</th>
					<th>Select New Setting</th>
					{!hideInheritance && <th>Calculated Setting</th>}
				</tr>
			</thead>
			<tbody>
				{targetDefinitions.map((definition, index) => {
					const permission = definitions[definition];

					const currentConfig = permissions.find(
						({ name }) => name === definition
					) || { name: definition, status: null };

					const indexInConfig = permissions.indexOf(currentConfig);

					return (
						<Permission
							key={index}
							permission={permission}
							inherited={inheritance && inheritance[definition]}
							hideInheritance={hideInheritance}
							value={currentConfig.status}
							setValue={(value) => {
								// If this item has not been defined yet.
								if (indexInConfig === -1)
									setPermissions([
										...permissions,
										{ ...currentConfig, status: value },
									]);
								// If this item has been defined.
								else {
									let newArray = [...permissions];

									newArray[indexInConfig].status = value;

									setPermissions(newArray);
								}
							}}
						/>
					);
				})}
			</tbody>
		</table>
	);
};

const PermissionGroups = ({
	definitions: targetDefinitions,
	permissions = [],
	setPermissions,
	userRoles = false,
	inheritance,
	hideInheritance = false,
}) => {
	const [active, setActive] = useState(0);

	const currentConfig = permissions.find(
		(permission) =>
			permission[userRoles ? "role" : "name"] ===
			targetDefinitions[active].name
	) || {
		[userRoles ? "role" : "name"]: targetDefinitions[active].name,
		permissions: [],
	};

	const indexInConfig = permissions.indexOf(currentConfig);

	return (
		<div className={styles["--cms-permissions"]}>
			<aside className={styles["--cms-permissions-aside"]}>
				<Nav
					items={targetDefinitions.map(({ label }) => label)}
					active={active}
					setActive={setActive}
				/>
			</aside>

			<Permissions
				definitions={targetDefinitions[active].definitions}
				permissions={currentConfig.permissions}
				inheritance={inheritance}
				hideInheritance={hideInheritance}
				setPermissions={(array) => {
					// If this item has not been defined yet.
					if (indexInConfig === -1)
						setPermissions([
							...permissions,
							{ ...currentConfig, permissions: array },
						]);
					// If this item has been defined.
					else {
						let newArray = [...permissions];
						newArray[indexInConfig].permissions = array;
						setPermissions(newArray);
					}
				}}
			/>
		</div>
	);
};

export default PermissionGroups;
