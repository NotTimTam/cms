import { combineClassNames } from "@/util/display";
import styles from "./index.module.scss";

const Toggle = ({ toggled, setToggled }) => {
	return (
		<button
			className={combineClassNames(
				styles["--cms-toggle"],
				toggled && styles["--cms-toggled"]
			)}
			type="button"
			onClick={() => setToggled(!toggled)}
		>
			<div className={styles["--cms-toggle-indicator"]}></div>
		</button>
	);
};

export default Toggle;
