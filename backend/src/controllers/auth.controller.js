import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

/* ================= STUDENT REGISTER ================= */
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      message: "Student registered successfull!!",
    });
  } catch (error) {
    console.log("Registration error : ", error);
    return res.status(500).json({
      message: "Server error"
    })
  }
};

/* ================= REGISTER ADMIN (ADMIN ONLY) ================= */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin user created successfully",
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.log("Register admin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= REGISTER VERIFIER (ADMIN ONLY) ================= */
export const registerVerifier = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verifier = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "verifier",
    });

    res.status(201).json({
      message: "Verifier user created successfully",
      user: { id: verifier._id, name: verifier.name, email: verifier.email, role: verifier.role }
    });
  } catch (error) {
    console.log("Register verifier error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      })
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({
      message: "Invalid credentials"
    });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({
        message: "Invalid credentials"
      });

    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
      {
        userId: user._id
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    )
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      message: "Login sucessfully",
      accessToken,
      role: user.role
    });

  } catch (error) {
    console.error("Login error : ", error);
    res.status(500).json({
      message: "Server error"
    })
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logout successfully"
    })
  } catch (error) {
    console.error("Logout error :", error);
    res.status(500).json({
      message: "Server error"
    })
  }
};

/* ================= GET ALL STUDENTS (ADMIN) ================= */
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id  email");

    return res.status(200).json({
      message: "Students retrieved",
      students,
    });

  } catch (err) {
    console.error("Get students error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET CURRENT USER ================= */
export const getCurrentUser = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    console.error("DB not connected - cannot get current user");
    return res.status(503).json({ message: "Database not connected" });
  }
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id)
      .select("_id name email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });

  } catch (err) {
    console.error("Get current user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= REFRESH TOKEN ================= */
export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id, role: user.role
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m"
      }
    )
    return res.status(200).json({ accessToken: newAccessToken, role: user.role })
  } catch (error) {
    console.error("Refresh error : ", error);
    return res.status(500).json({
      message: "Server error"
    })
  }
};
