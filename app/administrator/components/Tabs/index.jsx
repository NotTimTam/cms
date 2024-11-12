import styles from "./index.module.scss";

/**
 * A single tab display item.
 * @param {import("react").ReactElement} header The button content for this tab item.
 * @param {import("react").ReactElement} content The content to display within this tab.
 * @returns
 */
const Item = (header, content, ariaLabel) => ({ header, content, ariaLabel });

const Tabs = ({ items, currentItem, setCurrentItem }) => {
	if (!items || items.length === 0) return null;

	return (
		<>
			<nav className={`--cms-nav ${styles["--cms-tabs-nav"]}`}>
				{items.map(({ header, ariaLabel }, index) => (
					<button
						key={index}
						aria-label={ariaLabel}
						onClick={() => setCurrentItem(index)}
						aria-selected={
							currentItem === index ? "true" : undefined
						}
						className={
							currentItem === index ? "--cms-info" : undefined
						}
					>
						{header}
					</button>
				))}
			</nav>
			{items[currentItem] && (
				<main className={styles["--cms-tabs-content"]}>
					{items[currentItem].content}
				</main>
			)}
		</>
	);
};

Tabs.Item = Item;

Tabs.Item.Main = ({ children }) => (
	<article className={styles["--cms-tabs-content-main"]}>{children}</article>
);
Tabs.Item.Aside = ({ children }) => (
	<aside className={styles["--cms-tabs-content-aside"]}>{children}</aside>
);

export default Tabs;
