import Message from "./Message";

const Permissions = ({ permissions, setPermissions, roles }) => {
	return (
		<fieldset>
			<legend>Permissions</legend>

			{roles && roles.length > 0 && (
				<aside>
					<nav>NAV</nav>
				</aside>
			)}

			<table>
				<thead>
					<tr>
						<th>Action</th>
						<th>Select New Setting</th>
						<th>Calculated Setting</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Create</td>
						<td>
							<select name="" id=""></select>
						</td>
						<td>
							<Message type="error" fill>
								Not Allowed (Inherited)
							</Message>
						</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
	);
};

export default Permissions;
