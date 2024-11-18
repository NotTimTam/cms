import { depthIndicator } from "@/util/display";
import { Square, SquareCheck } from "lucide-react";

const Select = ({ items, selection, setSelection }) => {
	const hasParentSelected = (_id) => {
		let parents = [];

		const mapItem = (_id) => {
			const item = items.find(({ _id: f }) => _id === f);

			if (item.parent) {
				parents.push(item.parent);

				mapItem(item.parent);
			}
		};

		mapItem(_id);

		parents = parents.filter(
			(parent) => selection && selection.includes(parent)
		);

		return parents && parents.length > 0;
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
				const parentSelected = hasParentSelected(_id);
				const selected =
					selection && (selection.includes(_id) || parentSelected);

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
							disabled={parentSelected}
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
