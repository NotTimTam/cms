import Message from "./Message";
import { definitions } from "@/util/permissions";

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
	if (!actions) return null;

	return (
		<fieldset>
			<legend>Permissions</legend>

			{/* {roles && roles.length > 0 && (
				<aside>
					<nav>NAV</nav>
				</aside>
			)} */}

			<table>
				<thead>
					<tr>
						<th>Action</th>
						<th>Select New Setting</th>
						<th>Calculated Setting</th>
					</tr>
				</thead>
				<tbody>
					{actions.map((action, index) => {
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
					})}
				</tbody>
			</table>
		</fieldset>
	);
};

export default Permissions;
