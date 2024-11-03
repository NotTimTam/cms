import { LoaderCircle } from "lucide-react";

import styles from "./index.module.scss";

const Loading = () => {
	return (
		<div className={styles["--cms-loading-container"]}>
			<LoaderCircle className={styles["--cms-loading-spinner"]} />
		</div>
	);
};

export default Loading;
