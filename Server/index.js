import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";


import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import "./utils/cleanupUsers.js";

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


// Routes
app.use("/uploads", express.static("public"));
app.use("/audio", express.static("public/audio"));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/payment",paymentRoutes);
// Connect DB first then start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server Error:", error);
  }
};
startServer();