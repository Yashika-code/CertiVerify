import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API - Production endpoints
export const authAPI = {

  // Only students self-register (backend route is POST /api/auth/register)
  registerStudent: (data) => api.post("/auth/register", data),
  
  // Admin creates other roles (verifier, admin) - protected by backend
  registerAdmin: (data) => api.post("/auth/register-admin", data),
  registerVerifier: (data) => api.post("/auth/register-verifier", data),
  
  // Login for all roles
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  
  // Admin: get all students
  getStudents: () => api.get("/auth/students"),

};

// Certificate API
export const certificateAPI = {

  // Issue a new certificate
  issue: (data) => api.post("/certificates/issue", data),

  // Verify a certificate by ID
  verify: (certificateId) => api.post("/certificates/verify", { certificateId }),

  // Get all certificates (admin)
  getAll: () => api.get("/certificates"),

  // Get logged-in student's certificates
  getMyCertificates: () => api.get("/certificates/my"),
  
};


export default api;
