import { aliasRegex } from "../../../util/regex.js";
import { messageTypeEnum } from "../../../util/enum.js";
import mongoose from "mongoose";

const SystemMessageSchema = new mongoose.Schema(
	{
		alias: {
			type: String,
			required: [true, "No SystemMessage alias provided."],
			match: [aliasRegex, "Invalid alias provided to SystemMessage."],
			unique: [true, "SystemMessage alias must be unique."],
		},
		content: {
			type: String,
			required: false,
			default: "",
		},
		type: {
			type: String,
			required: true,
			default: "info",
			enum: messageTypeEnum,
		},
		confidential: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("SystemMessage", SystemMessageSchema);
