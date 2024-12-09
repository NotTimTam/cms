"use client";

import { useEffect, useState } from "react";
import Form from "../../components/Form";

export default function Page() {
	const [formData, setFormData] = useState({});

	useEffect(() => {
		console.log(formData);
	}, [formData]);

	return (
		<Form
			elements={[
				{
					type: "number",
					name: "testInput",
				},
				{
					type: "group",
					name: "groupA",
					elements: [
						{
							type: "text",
							name: "testOther",
						},
					],
				},
			]}
			{...{ formData, setFormData }}
		>
			Hello, world.
		</Form>
	);
}
