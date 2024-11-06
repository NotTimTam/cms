import styles from "./index.module.scss";
import Message from "../Message";
import {
	ChevronsUpDown,
	EllipsisVertical,
	Square,
	SquareCheck,
} from "lucide-react";

const List = ({ fields, items, itemIdentifier, selection, setSelection }) => {
	const isSelected = (id) => selection === "all" || selection.includes(id);
	const toggleSelected = (id) => {
		const alreadySelected = isSelected(id);

		if (alreadySelected) {
			if (selection === "all")
				setSelection(
					items
						.map(({ _id }) => _id)
						.filter((selectedId) => selectedId !== id)
				);
			else
				setSelection((selection) =>
					selection.filter((selectedId) => selectedId !== id)
				);
		} else {
			setSelection((selection) => [...selection, id]);
		}
	};

	return (
		<section className={styles["--cms-listings"]}>
			{items.length === 0 ? (
				<Message type="info">
					No {itemIdentifier}s found with that query.
				</Message>
			) : (
				<table className={styles["--cms-listings-table"]}>
					<thead>
						<tr>
							<th>
								<button
									aria-label="Select All"
									onClick={() =>
										setSelection((selection) =>
											selection === "all" ? [] : "all"
										)
									}
								>
									{selection === "all" ? (
										<SquareCheck />
									) : (
										<Square />
									)}
								</button>
							</th>
							<th>
								<button aria-label="Order">
									<ChevronsUpDown />
								</button>
							</th>

							{fields &&
								fields.map((field, index) => {
									return <th key={index}>{field.header}</th>;
								})}
						</tr>
					</thead>
					<tbody>
						{items.map(({ _id }, itemIndex) => (
							<tr key={_id}>
								<td>
									<button
										aria-label="Select Article"
										onClick={() => toggleSelected(_id)}
									>
										{isSelected(_id) ? (
											<SquareCheck />
										) : (
											<Square />
										)}
									</button>
								</td>
								<td>
									<span>
										<EllipsisVertical />
									</span>
								</td>

								{fields &&
									fields.map((field, fieldIndex) => {
										return (
											<td
												key={`${itemIndex}-${fieldIndex}`}
											>
												{field.listing.getJSXElement(
													itemIndex
												)}
											</td>
										);
									})}
							</tr>
						))}
					</tbody>
				</table>
			)}
		</section>
	);
};

List.Item = class Item {
	static typeEnum = ["toggle", "element"];
	constructor(type) {
		if (
			!type ||
			typeof type !== "string" ||
			!List.Item.typeEnum.includes(type)
		)
			throw new TypeError(
				`Invalid List.Item type property provided. Expected one of: ${List.Item.typeEnum}`
			);

		this.type = type;
	}

	getJSXElement = () => null;
};

List.Element = class Toggle extends List.Item {
	constructor(getElement) {
		super("element");

		this.getElement = getElement;
	}

	getJSXElement = (index) => this.getElement(index);
};

List.Toggle = class Toggle extends List.Item {
	constructor(getIcon = () => <Square />, toggle = () => {}, ariaLabel) {
		super("toggle");

		this.getIcon = getIcon;

		this.toggle = toggle;
		this.ariaLabel = ariaLabel;
	}

	getJSXElement = (index) => {
		const { getIcon, toggle, ariaLabel } = this;

		return (
			<span>
				<button aria-label={ariaLabel} onClick={() => toggle(index)}>
					{getIcon(index)}
				</button>
			</span>
		);
	};
};

export default List;
