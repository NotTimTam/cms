import { LoaderCircle } from "lucide-react";

import styles from "./index.module.scss";

const Loading = ({ color, size }) => {
	return (
		<div className={styles["--cms-loading-container"]}>
			<LoaderCircle
				color={color}
				size={size}
				className={styles["--cms-loading-spinner"]}
			/>
		</div>
	);
};

export default Loading;
