import express from "express";
import upload from "../middlewares/multer.js";
import { isAdmin, protect } from "../middlewares/auth.js";
import {
  uploadExcel,
  getUserUploads,
  getUploadData,
  getAllParsedData,
} from "../controllers/excelController.js";


const excelRouter = express.Router();

excelRouter.post("/upload", protect, upload.single("file"), uploadExcel);
excelRouter.get("/uploads", protect, getUserUploads);
excelRouter.get("/data/:uploadId", protect, getUploadData);
excelRouter.get("/parsed", protect, getAllParsedData);

export default excelRouter;
