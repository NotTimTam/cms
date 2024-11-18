import { CircleCheck, Info, OctagonAlert, TriangleAlert } from "lucide-react";
import styles from "./index.module.scss";
import SystemMessages from "./SystemMessages";

const Message = ({ type = "info", fill, children }) => {
	const icon = (() => {
		switch (type) {
			case "error":
				return <OctagonAlert />;
			case "warning":
				return <TriangleAlert />;
			case "success":
				return <CircleCheck />;
			default:
				return <Info />;
		}
	})();

	return (
		<div
			type={type}
			aria-errormessage={type === "error" ? "true" : undefined}
			className={styles["--cms-message"]}
			fill={fill ? "true" : undefined}
		>
			{icon}
			<p className={styles["--cms-message-content"]}>{children}</p>
		</div>
	);
};

Message.SystemMessages = SystemMessages;

export default Message;
