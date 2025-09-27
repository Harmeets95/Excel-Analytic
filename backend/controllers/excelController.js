import XLSX from "xlsx";
import path from "path";

import ExcelUpload from "../models/ExcelUpload.js";
import ParsedData from "../models/ParsedData.js";

export const uploadExcel = async (req, res) => {
  try {
    const upload = await ExcelUpload.create({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
    });
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No file uploaded. Make sure 'file' is the key and content type is multipart/form-data.",
      });
    }

    const filePath = path.join("uploads", req.file.filename);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    await ParsedData.create({
      uploadId: upload._id,
      data: jsonData,
    });

    res.status(200).json({
      success: true,
      message: "Excel uploaded and parsed successfully",
      uploadId: upload._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserUploads = async (req, res) => {
  try {
    const uploads = await ExcelUpload.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, uploads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUploadData = async (req, res) => {
  try {
    const parsed = await ParsedData.findOne({
      uploadId: req.params.uploadId,
    });

    if (!parsed) {
      return res
        .status(404)
        .json({ success: false, message: "No data found for this upload" });
    }

    res.status(200).json({ success: true, data: parsed.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllParsedData = async (req, res) => {
  try {
    const uploads = await ExcelUpload.find({ user: req.user._id }).select(
      "_id"
    );
    const uploadIds = uploads.map((upload) => upload._id);

    const parsed = await ParsedData.find({ uploadId: { $in: uploadIds } }).sort(
      { createdAt: -1 }
    );

    res.status(200).json({ success: true, parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
