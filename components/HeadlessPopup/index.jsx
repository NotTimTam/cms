import React, { createContext } from "react";
import { createRoot } from "react-dom/client";
import styles from "./index.module.scss";
import { useEffect, useRef, useState } from "react";

export const PopupContext = createContext(null);

const HeadlessPopup = ({ content, position, closePopup }) => {
	const popupRef = useRef(null);
	const [style, setStyle] = useState({});

	const getRect = () => {
		if (!popupRef || !popupRef.current) return { width: 0, height: 0 };

		return popupRef.current.getBoundingClientRect();
	};

	const calculateStyles = () => {
		if (!position) {
			return setStyle({});
		}

		const [x, y] = position;

		const rect = getRect();
		let top, left;

		top = y;
		if (top < 0) top = 0;
		if (top + rect.height > window.innerHeight)
			top = window.innerHeight - rect.height;

		left = x;
		if (left < 0) left = 0;
		if (left + rect.width > window.innerWidth)
			left = window.innerWidth - rect.width;

		setStyle({
			top,
			left,
			position: "absolute",
		});
	};

	useEffect(() => {
		calculateStyles();

		window.addEventListener("resize", calculateStyles);

		return () => {
			window.removeEventListener("resize", calculateStyles);
		};
	}, []);

	return (
		<div
			className={styles["--cms-headless-popup-wrapper"]}
			onClick={() => closePopup(null)}
		>
			<div
				className={styles["--cms-headless-popup-container"]}
				onClick={(e) => {
					e.stopPropagation();
				}}
				style={style}
				ref={popupRef}
			>
				<PopupContext.Provider value={closePopup}>
					{content}
				</PopupContext.Provider>
			</div>
		</div>
	);
};

/**
 * Create a popup outside of the main React renderer.
 * @param {import("react").ReactElement} content Popup content.
 * @param {Array<Number>} position Optional pixel-based position coordinates to place the popup content at. Respects page boundaries and stops content overflow. Format: `[x, y]`.
 * @returns {Promise} A promise that resolves with the data passed to `closePopup()`.
 */
export default function createHeadlessPopup(content, position = undefined) {
	return new Promise((resolve) => {
		const root = document.createElement("div");
		root.className = styles["--cms-headless-popup-renderer"];

		/**
		 * Close the popup.
		 */
		const handleClose = () => {
			rootInstance.unmount();
			if (root.parentElement === document.body)
				document.body.removeChild(root);
		};

		/**
		 * Close the popup and pass data to it.
		 * @param {*} passthrough Data to pass through.
		 */
		const closePopup = (passthrough) => {
			handleClose();
			resolve(passthrough);
		};

		document.body.appendChild(root);

		// Use createRoot to create a root from the container element
		const rootInstance = createRoot(root);

		// Use rootInstance.render to render the content again after the sizing has been calculated.
		rootInstance.render(
			<HeadlessPopup
				content={content}
				closePopup={closePopup}
				position={position}
			/>
		);
	});
}
