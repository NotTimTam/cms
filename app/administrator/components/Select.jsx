import { depthIndicator } from "@/util/display";
import { Square, SquareCheck } from "lucide-react";

const Select = ({ items, selection, setSelection }) => {
	return (
		<ul className="--cms-no-decor">
			{items.map(({ name, depth, _id }) => {
				const selected = selection && selection.includes(_id);

				return (
					<li
						key={_id}
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "flex-start",
							gap: "var(--padding)",
						}}
					>
						{depth > 0 &&
							depthIndicator(depth, "\u2014")
								.split(" ")
								.map((item, index) => (
									<span
										key={index}
										style={{
											marginLeft: "var(--gap)",
										}}
									>
										{item}
									</span>
								))}
						<button
							className="--cms-text-like"
							onClick={() => {
								if (selected)
									setSelection(
										selection.filter(
											(roleId) => roleId !== _id
										)
									);
								else setSelection([...selection, _id]);
							}}
						>
							{selected ? <SquareCheck /> : <Square />}
							{name}
						</button>
					</li>
				);
			})}
		</ul>
	);
};

export default Select;
