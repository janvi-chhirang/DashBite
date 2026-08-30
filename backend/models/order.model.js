import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String },
  isRated: {
    type: Boolean,
    default: false,
  },
  userRating: {
    type: Number,
    default: 0,
  },
});

const shopOrderSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shopOrderItems: [shopOrderItemSchema],
    status: {
      type: String,
      enum: [
        "Pending",
        "Preparing",
        "Out for delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveryOtp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    deliveryAddress: {
      text: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shopOrders: [shopOrderSchema],
    payment: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpaySecretId: {
      type: String,
      default: "",
    },
    razorpayPayment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
