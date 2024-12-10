const Select = ({ options, placeholder, value, setValue }) => {
	const placeholderId = `placeholder-${crypto.randomUUID()}`;

	return (
		<select
			value={value === undefined && placeholder ? placeholderId : value}
			onChange={({ target: { value } }) => setValue(value)}
		>
			{placeholder && (
				<option value={placeholderId} disabled={true}>
					{placeholder}
				</option>
			)}
			{options.map(({ id, label }, index) => (
				<option value={id} key={index}>
					{label}
				</option>
			))}
		</select>
	);
};

export default Select;
