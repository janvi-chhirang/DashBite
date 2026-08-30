import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createEditShop, getShop, getShopByCity } from "../controllers/shop.controller.js";
import { upload } from "../middlewares/multer.js";

const shopRouter = express.Router();

shopRouter.post("/create-edit-shop", isAuth, upload.single("image"), createEditShop);
shopRouter.get("/get-my-shop", isAuth, getShop);
shopRouter.get("/get-shop-by-city/:city", isAuth, getShopByCity);

export default shopRouter;