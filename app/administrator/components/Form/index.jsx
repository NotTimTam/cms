"use client";

import { combineClassNames } from "@/util/display";
import { createContext, Fragment } from "react";

import styles from "./index.module.scss";
import Message from "../Message";

const FormDataContext = createContext(null);

function Form(props) {
	const { children, className, elements, formData, setFormData, onSubmit } =
		props;

	const propHandler = (props) => {
		delete props.label;

		return props;
	};

	const elementHandler = (element) => {
		if (element instanceof Array)
			return (
				<section className={styles}>
					{element.map(mapper(formData, setFormData))}
				</section>
			);
		else if (element.type)
			return (
				<FormDataContext value={{ formData, setFormData }}>
					{(handlers[element.type] || handlers.default)(
						{ ...element },
						formData,
						setFormData
					)}
				</FormDataContext>
			);
		else return null;
	};

	const handlers = {
		group: (props, formData, setFormData) => {
			if (!props.name)
				return (
					<Message type="error">No name provided to group.</Message>
				);

			return props.elements.map(
				mapper(formData[props.name] || {}, (newFormData) =>
					setFormData({
						...formData,
						[props.name]: newFormData,
					})
				)
			);
		},
		default: (props, formData, setFormData) => {
			props.value = formData[props.name] || "";
			props.onChange = ({ target: { value } }) =>
				setFormData({
					...formData,
					[props.name]: value,
				});

			return <input {...propHandler(props)} />;
		},
	};

	const mapper = (formData, setFormData) => (element, index) => {
		if (!element) return null;

		const display = elementHandler(element);

		if (display)
			return (
				<Fragment key={index}>
					{element.label && (
						<label
							htmlFor={element.name}
							required={element.required}
						>
							{element.label}
						</label>
					)}

					{display}
				</Fragment>
			);
		else return null;
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();

				onSubmit(e);
			}}
			className={combineClassNames("--cms-form", className)}
		>
			{children}
			{elements && elements.map(mapper(formData, setFormData))}
		</form>
	);
}

export default Form;
