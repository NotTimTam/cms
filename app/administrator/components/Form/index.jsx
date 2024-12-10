"use client";

import { combineClassNames } from "@/util/display";
import React, { createContext, Fragment } from "react";

import styles from "./index.module.scss";
import Message from "../Message";
import Toggle from "../Toggle";

const FormDataContext = createContext(null);

function Form(props) {
	const { children, className, elements, formData, setFormData, onSubmit } =
		props;

	const inputContainerAsRow = ["radio", "checkbox", "toggle"];

	const propHandler = (props) => {
		delete props.label;

		return props;
	};

	const elementHandler = (element, formData, setFormData) => {
		if (
			React.isValidElement(element) ||
			typeof element === "string" ||
			typeof element === "number"
		)
			return element;
		else if (element instanceof Array)
			return (
				<section className={styles["--cms-form-input-group"]}>
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

	const valueControlHandler = (props, formData, setFormData) => {
		props.value = formData[props.name] || "";
		props.onChange = ({ target: { value } }) =>
			setFormData({
				...formData,
				[props.name]: value,
			});

		return props;
	};

	const handlers = {
		group: (props, formData, setFormData) => {
			if (!props.name)
				return (
					<Message type="error">No name provided to group.</Message>
				);

			const content = props.elements.map(
				mapper(formData[props.name] || {}, (newFormData) =>
					setFormData({
						...formData,
						[props.name]: newFormData,
					})
				)
			);

			if (props.legend)
				return (
					<fieldset name={props.name}>
						<legend>{props.legend}</legend>
						{content}
					</fieldset>
				);
			else return content;
		},
		textarea: (props, formData, setFormData) => {
			props = valueControlHandler(props, formData, setFormData);

			return <textarea {...propHandler(props)} />;
		},
		toggle: (props, formData, setFormData) => (
			<Toggle
				{...{
					...propHandler(props),
					toggled: formData[props.name] || false,
					setToggled: (value) =>
						setFormData({
							...formData,
							[props.name]: Boolean(value),
						}),
				}}
			/>
		),
		default: (props, formData, setFormData) => {
			props = valueControlHandler(props, formData, setFormData);

			return <input {...propHandler(props)} />;
		},
	};

	const mapper = (formData, setFormData) => (element, index) => {
		if (!element) return null;

		const display = elementHandler(element, formData, setFormData);

		if (display)
			return (
				<div
					className={combineClassNames(
						styles["--cms-form-input-container"],
						inputContainerAsRow.includes(element.type) &&
							styles["--cms-form-input-container-row"]
					)}
					key={index}
				>
					{element.label && (
						<label
							htmlFor={element.name}
							required={element.required}
						>
							{element.label}
						</label>
					)}

					{display}
				</div>
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
