import { depthIndicator } from "@/util/display";
import { Square, SquareCheck } from "lucide-react";

const Select = ({ items, selection, setSelection }) => {
	const hasParentSelected = (_id) => {
		const parent = items.find(({ children }) =>
			children.find(({ _id: s }) => s === _id)
		);

		if (!parent) return false;

		if (selection && selection.includes(parent)) return true;
		else return hasParentSelected(parent._id);
	};

	const toggleSelected = (_id) => {
		let newSelection = [...selection];

		const recurseThroughChildren = (_id, state) => {
			const children = items.filter(({ parent }) => parent === _id);

			for (const child of children) {
				const selected =
					newSelection && newSelection.includes(child._id);

				if (!state)
					newSelection = newSelection.filter(
						(itemId) => itemId !== child._id
					);
				else if (!selected) newSelection = [...newSelection, child._id];

				recurseThroughChildren(child._id, state);
			}
		};

		const selected = selection && selection.includes(_id);

		// Toggle this item selected.
		if (selected)
			newSelection = newSelection.filter((itemId) => itemId !== _id);
		else {
			throw new Error(
				"Ensure this works, if a parent is alreayd selected, the child should not be selectable. After doing that, make it so all children show selected if ancestor is selected."
			);

			// If this item has a parent selected, we do not select it.
			if (!hasParentSelected(_id)) {
				// Otherwise we select it and deselect all of its descendants.
				newSelection = [...newSelection, _id];

				recurseThroughChildren(_id, false);
			}
		}

		setSelection(newSelection);
	};

	return (
		<ul
			className="--cms-no-decor"
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "var(--gap)",
			}}
		>
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
							style={{
								alignItems: "flex-start",
								textAlign: "left",
								wordWrap: "break-word",
							}}
							onClick={() => toggleSelected(_id)}
						>
							{selected ? (
								<SquareCheck style={{ minWidth: 24 }} />
							) : (
								<Square style={{ minWidth: 24 }} />
							)}
							{name}
						</button>
					</li>
				);
			})}
		</ul>
	);
};

export default Select;
