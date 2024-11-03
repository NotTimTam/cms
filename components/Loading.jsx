import { LoaderCircle } from "lucide-react";

const Loading = () => {
	return (
		<div className="--cms-loading-container">
			<LoaderCircle className="--cms-loading-spinner" />
		</div>
	);
};

export default Loading;
