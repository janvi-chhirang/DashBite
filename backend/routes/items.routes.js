import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addItem,
  editItem,
  getItemById,
  deleteItem,
  getItemByCity,
  getItemByShop,
  searchItems,
  rating,
} from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.delete("/delete-item/:itemId", isAuth, deleteItem);
itemRouter.get("/get-item-by-city/:city", isAuth, getItemByCity);
itemRouter.get("/get-item-by-shop/:shopId", isAuth, getItemByShop);
itemRouter.get("/search-items", isAuth, searchItems);
itemRouter.post("/rating", isAuth, rating);

export default itemRouter;