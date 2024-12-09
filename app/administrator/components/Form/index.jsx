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
		else if (element instanceof Array)
			return (
				<section className={styles} key={index}>
					{element.map(mapper(formData, setFormData))}
				</section>
			);
		else if (element.type)
			return (
				<FormDataContext value={{ formData, setFormData }} key={index}>
					{(handlers[element.type] || handlers.default)(
						{ ...element },
						formData,
						setFormData
					)}
				</FormDataContext>
			);
		else return null;
	};

	return (
		<form className={combineClassNames("--cms-form", className)}>
			{children}
			{elements && elements.map(mapper(formData, setFormData))}
		</form>
	);
}

export default Form;
