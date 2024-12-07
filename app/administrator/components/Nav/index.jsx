import styles from "./index.module.scss";

const Nav = ({ items, active, setActive }) => {
	return (
		<nav className={styles["--cms-nav"]}>
			{items.map((item, index) => (
				<button
					aria-selected={active === index ? "true" : undefined}
					className="--cms-link"
					key={index}
					onClick={() => setActive(index)}
				>
					{item}
				</button>
			))}
		</nav>
	);
};

export default Nav;
