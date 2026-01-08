import express from "express";
import {
  registerStudent,
  loginUser,
  getAllStudents,
  getCurrentUser,
  logout,
  refresh
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// register
router.post("/register", registerStudent);

// login (single)
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/refresh",refresh)

// current user
router.get("/me", protect, getCurrentUser);

// admin: get all students
router.get("/students", protect, allowRoles("admin"), getAllStudents);

export default router;
