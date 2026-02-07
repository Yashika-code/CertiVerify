import express from "express";
import {
  registerStudent,
  registerAdmin,
  registerVerifier,
  loginUser,
  getAllStudents,
  getCurrentUser,
  logout,
  refresh
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Public: Student self-register
router.post("/register", registerStudent);

// Admin only: Create admin user
router.post("/register-admin", protect, allowRoles("admin"), registerAdmin);

// Admin only: Create verifier user
router.post("/register-verifier", protect, allowRoles("admin"), registerVerifier);

// login (single endpoint for all roles)
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/refresh", refresh)

// current user
router.get("/me", protect, getCurrentUser);

// admin: get all students
router.get("/students", protect, allowRoles("admin"), getAllStudents);

export default router;
