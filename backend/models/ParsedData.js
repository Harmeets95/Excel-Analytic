import mongoose from "mongoose";

const parsedDataSchema = new mongoose.Schema(
  {
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExcelUpload",
      required: true,
    },
    data: {
      type: [mongoose.Schema.Types.Mixed], 
      required: true,
    },
  },
  { timestamps: true }
);

const ParsedData = mongoose.model("ParsedData", parsedDataSchema);
export default ParsedData
