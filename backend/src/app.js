import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import { protect } from "./middlewares/auth.middleware.js";
import { getCurrentUser } from "./controllers/auth.controller.js";

const app = express();

// CORS: allow frontend origin (env) or reflect request origin; allow common headers/methods
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

// Ensure `/api/auth/me` is directly available (explicit route) to avoid routing issues
app.get("/api/auth/me", protect, getCurrentUser);
app.use("/api/certificates", certificateRoutes);
app.use("/certificates", express.static(path.join(process.cwd(), "public", "certificates")));

export default app;
