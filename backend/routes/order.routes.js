import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getMyOrders,
  placeOrder,
  updateOrderStatus,
  getDeliveryBoyAssignments,
  acceptDeliveryAssignment,
  getDeliveryBoyCurrentAssignment,
  getOrderById,
  sendDeliveryOTP,
  verifyDeliveryOTP,
  verifyPayment,
  getDeliveryBoyStats, 
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignments);
orderRouter.get(
  "/get-current-assignment",
  isAuth,
  getDeliveryBoyCurrentAssignment,
);
orderRouter.get(
  "/accept-assignment/:assignmentId",
  isAuth,
  acceptDeliveryAssignment,
);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOTP);
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOTP);
orderRouter.post("/verify-payment", isAuth, verifyPayment);

orderRouter.get("/get-delivery-stats", isAuth, getDeliveryBoyStats);

export default orderRouter;
