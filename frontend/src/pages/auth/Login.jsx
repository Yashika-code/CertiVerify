import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";

/**
 * Login.jsx - User Authentication Page
 * 
 * Security Notes:
 * - Passwords are sent via HTTPS POST (enforced in production)
 * - JWT tokens stored in localStorage (should migrate to httpOnly cookies)
 * - Role-based redirects happen after successful authentication
 * - Invalid/expired tokens are cleared from localStorage by ProtectedRoute
 */

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Role-based redirect mapping
  const roleRedirectMap = {
    student: "/student",
    admin: "/admin",
    verifier: "/verify",
  };

  /**
   * Validate login form fields
   * Email must be valid format, password is required
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Handle form submission and authentication
   * Validates input → Calls backend login → Stores JWT + role → Redirects by role
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form before sending to backend
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const token = response.data.accessToken;
      const role = response.data.role?.toLowerCase();

      // ----- VALIDATION FIRST -----
      if (!token) {
        throw new Error("Authentication failed: No token received");
      }

      if (!role) {
        throw new Error("Authentication failed: No role information");
      }

      // ----- STORE ONLY WHAT WE ACTUALLY HAVE -----
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        navigate(roleRedirectMap[role] || "/student", { replace: true });
      }, 500);

    } catch (err) {
      const serverError =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials.";

      setError(serverError);
      console.error("Login error:", err);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">Digital Certificate System</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.email ? "border-red-500" : "border-gray-300"
                }`}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.password ? "border-red-500" : "border-gray-300"
                }`}
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create one
            </button>
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-700">
            <strong>Demo:</strong> Use any registered email and its password to sign in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
