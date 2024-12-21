import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [
				true,
				"You must provide the id of the user that checked this component out.",
			],
		},
		component: {
			type: mongoose.Schema.Types.ObjectId,
			required: [
				true,
				"You must provide the id of the component being checked out.",
			],
		},
		ref: {
			type: String,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Checkout", CheckoutSchema);
