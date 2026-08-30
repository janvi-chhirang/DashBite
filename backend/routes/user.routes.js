import express from "express";
import { getCurrUser,updateUserLocation } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get("/current-user",isAuth,getCurrUser);
userRouter.post("/update-location",isAuth,updateUserLocation);

export default userRouter;