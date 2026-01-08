import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= STUDENT REGISTER ================= */
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student"
    });

    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.status(201).json({
      message: "Student registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= COMPANY REGISTER (ADMIN) ================= */
export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.status(201).json({
      message: "Company registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= VERIFIER REGISTER ================= */
export const registerVerifier = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "verifier"
    });

    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.status(201).json({
      message: "Verifier registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN (COMMON FOR ALL) ================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 MATCH FRONTEND EXPECTATION
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ===================== LOGOUT ===================== */
export const LogoutUser = async (req, res) => {
  res.status(200).json({
    message: "Logout successful"
  });
};

/* ===================== GET ALL STUDENTS (ADMIN) ===================== */
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("_id name email");
    res.status(200).json({
      message: "Students retrieved",
      students
    });
  } catch (err) {
    console.error("Get students error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).select("_id name email role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/* ================= STUDENT REGISTER ================= */
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student"
    });

    res.status(201).json({
      message: "Student registered successfully",
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= LOGIN (COMMON FOR ALL) ================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password not matched" });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id
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
      sameSize: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      message: "Login successful",
      accessToken,
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ===================== LOGOUT ===================== */
export const logout = async (req, res) => {
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
        message: "logout successfully"
    })
}


/* ===================== GET ALL STUDENTS (ADMIN) ===================== */
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("_id name email");
    res.status(200).json({
      message: "Students retrieved",
      students
    });
  } catch (err) {
    console.error("Get students error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).select("_id name email role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refresh = async (req, res) => {
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
    return res.status(200).json({ accessToken: newAccessToken })
}
