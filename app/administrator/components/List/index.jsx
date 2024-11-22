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
	arrayMove,
} from "@dnd-kit/sortable";
import Paginate from "../Paginate";

const SortableItem = (props) => {
	const {
		children,
		order,
		id,
		gridColumn,
		hide,
		items,
		fields,
		fieldOffset,
		isSelected,
		toggleSelected,
		swapItems,
	} = props;
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id,
		disabled: !order || order.disabled,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		gridColumn: gridColumn,
	};

	return (
		<>
			<div
				className={styles["--cms-listings-table-body-row"]}
				ref={setNodeRef}
				style={style}
				aria-hidden={hide ? "true" : undefined}
			>
				{order && (
					<div
						className={
							styles["--cms-listings-table-body-row-column"]
						}
						style={{
							gridColumn: `2 / 3`,
							gridRow: `1 / 2`,
						}}
					>
						<button
							disabled={!order || order.disabled}
							className={
								styles["--cms-listings-table-body-drag-thumb"]
							}
							{...listeners}
							{...attributes}
							style={{
								cursor: isDragging ? "grabbing" : "pointer",
							}}
							aria-label={order.ariaLabel}
						>
							{order.icon}
						</button>
					</div>
				)}
				{children}
				{(!isDragging || hide) && items && items.length > 0 && (
					<Listings
						{...{
							items,
							fields,
							fieldOffset,
							isSelected,
							toggleSelected,
							order,
							swapItems,
						}}
					/>
				)}
			</div>
		</>
	);
};

const Listings = ({
	items,
	fields,
	fieldOffset,
	totalItems,
	isSelected,
	toggleSelected,
	order,
	swapItems,
}) => {
	const sensors = useSensors(useSensor(PointerSensor));

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={items.map(({ _id }) => _id)}
				strategy={verticalListSortingStrategy}
			>
				{items.map(({ _id, hide, children }, itemIndex) => (
					<SortableItem
						key={itemIndex}
						index={itemIndex}
						id={_id}
						gridColumn={`1 / ${totalItems}`}
						order={order}
						hide={hide}
						{...{
							items: children,
							fields,
							fieldOffset,
							isSelected,
							toggleSelected,
							order,
							swapItems,
						}}
					>
						{!hide && (
							<>
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
										onClick={() => toggleSelected(_id)}
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
										.filter((field) => field.listing)
										.map((field, fieldIndex) => {
											return (
												<div
													className={
														styles[
															"--cms-listings-table-body-row-column"
														]
													}
													key={`${_id}-${fieldIndex}`}
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
														_id,
														items
													)}
												</div>
											);
										})}
							</>
						)}
					</SortableItem>
				))}
			</SortableContext>
		</DndContext>
	);

	function handleDragEnd(event) {
		if (!order || order.disabled) return;

		const { active, over } = event;

		if (!over) return;

		if (active.id !== over.id) {
			let newItems = items.map(({ _id }) => _id);
			newItems = arrayMove(
				newItems,
				newItems.indexOf(active.id),
				newItems.indexOf(over.id)
			);

			swapItems(
				active.id,
				over.id,
				newItems.indexOf(active.id) > newItems.indexOf(over.id) ? 1 : -1
			);
		}
	}
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
	// Number of fields + Order column + Selection column.
	const totalItems = fields.length + (order ? 1 : 0) + 2;

	// 1 (Selection) + 1 (Order) + 1 (Accounting for the offset from the grid endpoint of the last one)
	const fieldOffset = 1 + (order ? 1 : 0) + 1;

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
			{!items || items.length === 0 ? (
				<Message type="info">No {itemIdentifier} found.</Message>
			) : (
				<div className={styles["--cms-listings-table"]}>
					<header
						className={styles["--cms-listings-table-header"]}
						style={{
							gridColumn: `1 / ${totalItems}`,
						}}
					>
						<div
							className={
								styles["--cms-listings-table-header-column"]
							}
							style={{ gridColumn: "1 / 2" }}
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
								style={{ gridColumn: "2 / 3" }}
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
											style={{
												gridColumn: `${
													index + fieldOffset
												} / ${index + fieldOffset + 1}`,
											}}
										>
											{field.header}
										</div>
									);
								})}
					</header>
					<main
						className={styles["--cms-listings-table-body"]}
						style={{
							gridColumn: `1 / ${totalItems}`,
						}}
					>
						<Listings
							{...{
								items,
								fields,
								fieldOffset,
								totalItems,
								isSelected,
								toggleSelected,
								order,
								swapItems,
							}}
						/>
					</main>
				</div>
			)}

			{query.itemsPerPage !== "all" && query.numPages > 1 && (
				<Paginate {...{ query, setQuery }} />
			)}
		</section>
	);
};

List.InfoBlock = ({ children }) => (
	<div className={styles["--cms-listing-info"]}>{children}</div>
);

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

	getJSXElement = (_id, items) => this.getElement(_id, items);
};

List.Toggle = class Toggle extends List.Item {
	constructor(getIcon = () => <Square />, toggle = () => {}, ariaLabel) {
		super("toggle");

		this.getIcon = getIcon;

		this.toggle = toggle;
		this.ariaLabel = ariaLabel;
	}

	getJSXElement = (_id, items) => {
		const { getIcon, toggle, ariaLabel } = this;

		return (
			<button aria-label={ariaLabel} onClick={() => toggle(_id, items)}>
				{getIcon(_id, items)}
			</button>
		);
	};
};

export default List;
