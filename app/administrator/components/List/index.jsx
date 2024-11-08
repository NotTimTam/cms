import styles from "./index.module.scss";
import Message from "../Message";
import {
	ChevronDown,
	ChevronsUpDown,
	ChevronUp,
	Square,
	SquareCheck,
} from "lucide-react";
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";

const SortableItem = (props) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: props.id,
		disabled: !props.order || props.order.disabled,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		gridColumn: props.gridColumn,
		cursor: isDragging ? "grabbing" : "pointer",
	};

	return (
		<div
			className={styles["--cms-listings-table-body-row"]}
			ref={setNodeRef}
			style={style}
		>
			{props.order && (
				<div
					className={styles["--cms-listings-table-body-row-column"]}
					style={{
						gridColumn: `2 / 3`,
						gridRow: `1 / 2`,
					}}
				>
					<button
						disabled={!props.order || props.order.disabled}
						className={
							styles["--cms-listings-table-body-drag-thumb"]
						}
						{...listeners}
						{...attributes}
						aria-label={props.order.ariaLabel}
					>
						{props.order.icon}
					</button>
				</div>
			)}
			{props.children}
		</div>
	);
};

const List = ({
	fields,
	items,
	itemIdentifier,
	selection,
	setSelection,
	order,
	swapItems,
	query,
	setQuery,
}) => {
	const sensors = useSensors(useSensor(PointerSensor));

	const fieldOffset = 3;

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
				<div
					className={styles["--cms-listings-table"]}
					style={{
						gridTemplateColumns: `repeat(${fields.length}, auto)`,
					}}
				>
					<header
						className={styles["--cms-listings-table-header"]}
						style={{
							gridColumn: `1 / ${
								fields.length + fieldOffset + 1
							}`,
						}}
					>
						<div
							className={
								styles["--cms-listings-table-header-column"]
							}
						>
							<button
								aria-label="Select All"
								onClick={() =>
									setSelection((selection) =>
										selection === "all" ||
										selection.length > 0
											? []
											: "all"
									)
								}
							>
								{selection === "all" || selection.length > 0 ? (
									<SquareCheck />
								) : (
									<Square />
								)}
							</button>
						</div>

						{order && (
							<div
								className={
									styles["--cms-listings-table-header-column"]
								}
							>
								{List.Header(
									{ field: order.field },
									query,
									setQuery
								)}
							</div>
						)}

						{fields &&
							fields
								.filter((field) => field.header)
								.map((field, index) => {
									return (
										<div
											className={
												styles[
													"--cms-listings-table-header-column"
												]
											}
											key={index}
										>
											{field.header}
										</div>
									);
								})}
					</header>
					<main
						className={styles["--cms-listings-table-body"]}
						style={{
							gridColumn: `1 / ${
								fields.length + fieldOffset + 1
							}`,
						}}
					>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={items.map(({ _id }) => _id)}
								strategy={verticalListSortingStrategy}
							>
								{items.map(({ _id }, itemIndex) => (
									<SortableItem
										key={_id}
										index={itemIndex}
										id={_id}
										gridColumn={`1 / ${
											fields.length + fieldOffset + 1
										}`}
										order={order}
									>
										<div
											className={
												styles[
													"--cms-listings-table-body-row-column"
												]
											}
											style={{
												gridColumn: "1 / 2",
											}}
										>
											<button
												aria-label="Select Article"
												onClick={() =>
													toggleSelected(_id)
												}
											>
												{isSelected(_id) ? (
													<SquareCheck />
												) : (
													<Square />
												)}
											</button>
										</div>

										{fields &&
											fields
												.filter(
													(field) => field.listing
												)
												.map((field, fieldIndex) => {
													return (
														<div
															className={
																styles[
																	"--cms-listings-table-body-row-column"
																]
															}
															key={`${itemIndex}-${fieldIndex}`}
															style={{
																gridColumn: `${
																	fieldIndex +
																	fieldOffset
																} / ${
																	fieldIndex +
																	fieldOffset +
																	1
																}`,
															}}
														>
															{field.listing.getJSXElement(
																itemIndex
															)}
														</div>
													);
												})}
									</SortableItem>
								))}
							</SortableContext>
						</DndContext>
					</main>
				</div>
			)}
		</section>
	);

	function handleDragEnd(event) {
		if (!order || order.disabled) return;

		const { active, over } = event;

		if (active.id !== over.id) swapItems(active.id, over.id);
	}
};

/**
 * Create a List header element.
 * @param {Object} item The header data item.
 * @param {String} item.field The field this header sorts by.
 * @param {String} item.label The label for this field.
 * @param {Object} query The current query object.
 * @param {function} setQuery The method used to set the query.
 * @returns {import("react").ReactElement} A List header element.
 */
List.Header = (item, query, setQuery) => {
	const { field, label } = item;
	const active = query.sort && query.sort.field === field;
	const dir = query.sort && query.sort.dir;

	return (
		<button
			aria-label={label}
			onClick={() => {
				if (active) {
					if (dir === 1)
						setQuery((query) => ({
							...query,
							sort: {
								field,
								dir: -1,
							},
						}));
					else {
						const newQuery = {
							...query,
						};
						delete newQuery.sort;
						setQuery(newQuery);
					}
				} else
					setQuery((query) => ({
						...query,
						sort: { field, dir: 1 },
					}));
			}}
		>
			{label}{" "}
			{active ? (
				dir === -1 ? (
					<ChevronUp />
				) : (
					<ChevronDown />
				)
			) : (
				<ChevronsUpDown />
			)}
		</button>
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
			<button aria-label={ariaLabel} onClick={() => toggle(index)}>
				{getIcon(index)}
			</button>
		);
	};
};

export default List;
