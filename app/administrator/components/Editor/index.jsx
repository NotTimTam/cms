import { useContext, useState } from "react";
import styles from "./index.module.scss";
import {
	Accessibility,
	ChevronDown,
	CircleHelp,
	Eye,
	GitBranch,
	Save,
	X,
} from "lucide-react";
import Tabs from "../Tabs";
import { aliasRegex, nameRegex } from "@/util/regex";
import Link from "next/link";
import createHeadlessPopup, { PopupContext } from "@/components/HeadlessPopup";

const Editor = ({
	message,

	saveData,
	saveOptions,
	closeEditor,

	versionsHref,
	previewHref,
	accessiblityCheckHref,
	helpHref,

	tabs,

	children,
}) => {
	const [tab, setTab] = useState(0);

	return (
		<>
			{message && (
				<div className={styles["--cms-message-container"]}>
					{message}
				</div>
			)}
			<nav className="--cms-nav">
				<section>
					<button
						className="--cms-success"
						aria-label="Save"
						onClick={saveData}
					>
						<Save /> Save
					</button>
					<span>
						<button
							className="--cms-success"
							aria-label="Save & Close"
							onClick={async () => {
								const savedSuccessfully = await saveData();

								if (savedSuccessfully) closeEditor();
							}}
						>
							<Save /> Save & Close
						</button>
						{saveOptions && saveOptions.length > 0 && (
							<button
								className="--cms-success"
								aria-label="More Save Options"
								onClick={async (e) => {
									const rect =
										e.target.getBoundingClientRect();

									const PopupContent = () => {
										const closePopup =
											useContext(PopupContext);

										return (
											<div
												className="--cms-popup-content"
												style={{ minWidth: rect.width }}
											>
												<nav className="--cms-popup-nav">
													{saveOptions.map(
														(
															{
																label,
																ariaLabel,
																callback,
															},
															index
														) => (
															<button
																key={index}
																type="button"
																aria-label={
																	ariaLabel
																}
																onClick={async () => {
																	await callback();
																	closePopup();
																}}
															>
																{label}
															</button>
														)
													)}
												</nav>
											</div>
										);
									};

									await createHeadlessPopup(
										<PopupContent />,
										[rect.x, rect.bottom]
									);
								}}
							>
								<ChevronDown />
							</button>
						)}
					</span>

					<button
						className="--cms-error"
						aria-label="Close"
						onClick={closeEditor}
					>
						<X /> Close
					</button>
				</section>

				<section>
					{versionsHref && (
						<Link
							className="--cms-button --cms-info"
							aria-label="Versions"
							href={versionsHref}
							target="_blank"
						>
							<GitBranch />
							Versions
						</Link>
					)}

					{previewHref && (
						<Link
							className="--cms-button --cms-info"
							aria-label="Preview"
							href={previewHref}
							target="_blank"
						>
							<Eye />
							Preview
						</Link>
					)}

					{accessiblityCheckHref && (
						<Link
							className="--cms-button --cms-info"
							aria-label="Accessibility Check"
							href={accessiblityCheckHref}
							target="_blank"
						>
							<Accessibility />
							Accessibility Check
						</Link>
					)}

					{helpHref && (
						<Link
							className="--cms-button --cms-highlight"
							aria-label="Help"
							href={accessiblityCheckHref}
							target="_blank"
						>
							<CircleHelp /> Help
						</Link>
					)}
				</section>
			</nav>
			<section className={styles["--cms-editor-content"]}>
				{children}
				<div className={styles["--cms-editor-tabs"]}>
					<Tabs
						{...{
							currentItem: tab,
							setCurrentItem: setTab,
						}}
						items={tabs}
					/>
				</div>
			</section>
		</>
	);
};

Editor.ContentIdentifierForm = ({
	data,
	setData,
	namePlaceholder = "My Article",
	aliasPlaceholder = "my-article",
}) => {
	return (
		<form
			onSubmit={(e) => e.preventDefault()}
			className={`--cms-form ${styles["--cms-editor-title-form"]}`}
		>
			<section>
				<label htmlFor="name" required>
					Name
				</label>
				<input
					type="text"
					name="name"
					id="name"
					placeholder={namePlaceholder}
					autoComplete="off"
					value={data.name || ""}
					onChange={({ target: { value } }) =>
						setData((data) => ({
							...data,
							name: value,
						}))
					}
					pattern={nameRegex}
				/>
			</section>
			<section>
				<label htmlFor="alias" required>
					Alias
				</label>
				<input
					type="text"
					name="alias"
					id="alias"
					placeholder={aliasPlaceholder}
					autoComplete="off"
					value={data.alias || ""}
					onChange={({ target: { value } }) =>
						setData((data) => ({
							...data,
							alias: value,
						}))
					}
					pattern={aliasRegex}
				/>
			</section>
		</form>
	);
};

export default Editor;
