"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import Tabs from "../../components/Tabs";
import { capitalizeWords } from "@/util/display";
import Message from "../../components/Message";
import API from "@/util/API";
import { getToken } from "@/app/cookies";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import Editor from "../../components/Editor";

const defaultCategory = {
	name: "",
	alias: "",
	description: "",
	notes: "",
	status: "unpublished",
	tags: [],
};

const CategoryEditor = ({ id }) => {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const [category, setCategory] = useState(
		id ? { _id: id } : defaultCategory
	);

	/**
	 * Unpublished
	 * Published
	 * Trashed
	 * Archived
	 */

	// Functions
	const getCategory = async () => {
		setMessage(null);

		setLoading(true);

		try {
			if (!category._id) return;

			const token = await getToken();

			const {
				data: { category: newCategory },
			} = await API.get(
				API.createRouteURL(API.categories, id),
				API.createAuthorizationConfig(token)
			);

			setCategory(newCategory);
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);
		}

		setLoading(false);
	};

	const saveCategory = async () => {
		setLoading(true);
		setMessage(null);

		let ret;

		try {
			const token = await getToken();

			const {
				data: { category: newCategory },
			} = category._id
				? await API.patch(
						API.createRouteURL(API.categories, category._id),
						category,
						API.createAuthorizationConfig(token)
				  )
				: await API.post(
						API.categories,
						category,
						API.createAuthorizationConfig(token)
				  );

			setCategory(newCategory);

			ret = true;
		} catch (error) {
			console.error(error);

			setMessage(<Message type="error">{error.data}</Message>);

			ret = false;
		}

		setLoading(false);

		return ret;
	};

	useEffect(() => {
		if (id) getCategory();
	}, [id]);

	if (loading) return <Loading />;

	return (
		<>
			<Editor
				{...{
					message,
					saveData: saveCategory,
					closeEditor: () =>
						router.push("/administrator/dashboard/categories"),
					tabs: [
						Tabs.Item(
							"Category",
							<>
								<Tabs.Item.Main>
									<form
										onSubmit={(e) => e.preventDefault()}
										className="--cms-form"
									>
										<label htmlFor="description">
											Description
										</label>
										<textarea
											placeholder="What sort of content is in this category?"
											value={category.description || ""}
											onChange={({ target: { value } }) =>
												setCategory((category) => ({
													...category,
													description: value,
												}))
											}
											id="description"
										></textarea>
									</form>
								</Tabs.Item.Main>
								<Tabs.Item.Aside>
									<form
										onSubmit={(e) => e.preventDefault()}
										className="--cms-form"
									>
										<label htmlFor="Parent">Parent</label>
										Coming Soon (dropdown)
										<label htmlFor="status">Status</label>
										<button id="status">
											{capitalizeWords(category.status) ||
												"Unpublished"}
											<ChevronDown />
										</button>
										{/* <label htmlFor="access">Access</label>
										Coming Soon (dropdown) */}
										<label htmlFor="tags">Tags</label>
										Coming Soon
										<label htmlFor="notes">Notes</label>
										<textarea
											id="notes"
											placeholder="Recent changes, help for other editors, etc..."
											aria-label="Notes"
											value={category.notes || ""}
											onChange={({ target: { value } }) =>
												setCategory((category) => ({
													...category,
													notes: value,
												}))
											}
										></textarea>
										<label htmlFor="version-note">
											Version Note
										</label>
										Coming Soon
									</form>
								</Tabs.Item.Aside>
							</>,
							"Content"
						),
						Tabs.Item(
							"Options",
							<>
								(fieldset with legend) layout, image, image
								description (alt text), no description
								(checkbox) (decorative image - no description
								required)
							</>,
							"Options"
						),
						Tabs.Item(
							"Publishing",
							<>
								Two fieldsets, publishing and metadata. In
								publishing: created date, created by, modified
								date (readonly), modified by (readonly), hits
								(readonly), id (readonly). In metadata: meta
								description (300 chars), keywords, author,
								robots option dropdown
							</>,
							"Publishing"
						),
						Tabs.Item(
							"Permissions",
							<>Permissions</>,
							"Permissions"
						),
					],
				}}
			>
				<Editor.ContentIdentifierForm
					data={category}
					setData={setCategory}
					namePlaceholder="My Category"
					aliasPlaceholder="my-category"
				/>
			</Editor>
		</>
	);
};

export default CategoryEditor;
