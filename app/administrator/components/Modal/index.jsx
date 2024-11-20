"use client";

import { useContext } from "react";
import styles from "./index.module.scss";
import { PopupContext } from "@/components/HeadlessPopup";

const Modal = ({ children }) => {
	const closePopup = useContext(PopupContext);

	return (
		<div
			className={styles["--cms-modal-container"]}
			onClick={() => closePopup()}
		>
			<div className={styles["--cms-modal"]}>{children}</div>
		</div>
	);
};

Modal.Options = ({ children }) => (
	<nav className={styles["--cms-modal-options"]}>{children}</nav>
);

export default Modal;
