import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";

import connectdb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/items.routes.js";
import orderRouter from "./routes/order.routes.js";
import { socketHandler } from "./socket.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://dashbite-isyw.onrender.com",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://dashbite-isyw.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

socketHandler(io);

// ---------------- SPA Catch-All Fallback ----------------
const __dirname = path.resolve();

// Serve frontend dist build folder
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Any non-API route serves index.html (fixes Refresh Not Found)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
});
// --------------------------------------------------------

server.listen(PORT, () => {
  connectdb();
  console.log(`Server is running on port ${PORT}`);
});
