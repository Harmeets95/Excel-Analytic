import express from "express";
import { protect } from "../middlewares/auth.js";
import { getChartData } from "../controllers/chatController.js";

const chartRouter = express.Router();


chartRouter.post("/get",protect,getChartData);

export default chartRouter
