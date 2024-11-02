import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "No Menu name provided."],
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Menu", MenuSchema);
