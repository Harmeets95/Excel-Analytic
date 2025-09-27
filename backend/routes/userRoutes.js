import express from "express";
import { getAllUsers, login, makeAdmin, register } from "../controllers/userController.js";
import { isAdmin, protect } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.put("/make-admin/:id",protect, makeAdmin)
userRouter.get("/users", protect, isAdmin, getAllUsers);


export default userRouter;
