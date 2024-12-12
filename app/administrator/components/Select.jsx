const Select = ({ options, placeholder, value, setValue }) => {
	const placeholderId = `placeholder-${crypto.randomUUID()}`;

	const selectValue = (index) => {
		const value = options[index];

		setValue(value.id);
	};

	return (
		<select
			value={
				value === undefined && placeholder
					? placeholderId
					: options.indexOf(options.find(({ id }) => id === value))
			}
			onChange={({ target: { value } }) => selectValue(value)}
		>
			{placeholder && (
				<option value={placeholderId} disabled={true}>
					{placeholder}
				</option>
			)}
			{options.map(({ label }, index) => (
				<option value={index} key={index}>
					{label}
				</option>
			))}
		</select>
	);
};

export default Select;
