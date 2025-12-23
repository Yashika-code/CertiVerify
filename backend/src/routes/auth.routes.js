import express from "express";
import {
  registerStudent,
  registerCompany,
  registerVerifier,
  loginUser,
  LogoutUser,
  getAllStudents,
  getCurrentUser
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// register
router.post("/register-student", registerStudent);
router.post("/register-company", registerCompany);
router.post("/register-verifier", registerVerifier);

// login (single)
router.post("/login", loginUser);
router.post("/logout", LogoutUser);

// current user
router.get("/me", protect, getCurrentUser);

// admin: get all students
router.get("/students", protect, allowRoles("admin"), getAllStudents);

export default router;
