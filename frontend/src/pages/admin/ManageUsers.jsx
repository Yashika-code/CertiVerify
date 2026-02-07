import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { authAPI } from "../../services/api";
import { LayoutDashboard, FilePlus, Files, Users } from "lucide-react";

const ManageUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userType, setUserType] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const isActive = (path) => location.pathname === path;

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const api = userType === "admin" ? authAPI.registerAdmin : authAPI.registerVerifier;
      const response = await api({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess(`${userType.charAt(0).toUpperCase() + userType.slice(1)} created successfully!`);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      const serverError =
        err.response?.data?.message ||
        err.message ||
        `Failed to create ${userType}. Please try again.`;

      setError(serverError);
      console.error("Create user error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100">
      <Navbar dashboard="Admin Dashboard" post="Administrator" />

      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">

        {/* SIDEBAR */}
        <aside className="flex md:flex-col flex-row md:w-64 w-full bg-white border-b md:border-r p-2 md:p-4 sticky top-0 overflow-x-auto">
          <button
            onClick={() => navigate("/admin")}
            className={`sidebar-btn flex items-center gap-2 md:w-full whitespace-nowrap
              ${isActive("/admin") ? "bg-green-50 text-green-700" : "hover:bg-gray-100"}
            `}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button
            onClick={() => navigate("/admin/issue")}
            className={`sidebar-btn flex items-center gap-2 md:w-full whitespace-nowrap ml-2 md:ml-0
              ${isActive("/admin/issue") ? "bg-green-50 text-green-700" : "hover:bg-gray-100"}
            `}
          >
            <FilePlus size={18} /> Issue Certificate
          </button>

          <button
            onClick={() => navigate("/admin/certificates")}
            className={`sidebar-btn flex items-center gap-2 md:w-full whitespace-nowrap ml-2 md:ml-0
              ${isActive("/admin/certificates") ? "bg-green-50 text-green-700" : "hover:bg-gray-100"}
            `}
          >
            <Files size={18} /> All Certificates
          </button>

          <button
            onClick={() => navigate("/admin/manage-users")}
            className={`sidebar-btn flex items-center gap-2 md:w-full whitespace-nowrap ml-2 md:ml-0
              ${isActive("/admin/manage-users") ? "bg-green-50 text-green-700" : "hover:bg-gray-100"}
            `}
          >
            <Users size={18} /> Manage Users
          </button>
        </aside>

        {/* FORM */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
            <h1 className="text-2xl font-semibold mb-6">Create New User</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select User Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="admin"
                      checked={userType === "admin"}
                      onChange={(e) => setUserType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Admin</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="verifier"
                      checked={userType === "verifier"}
                      onChange={(e) => setUserType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Verifier</span>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? `Creating ${userType}...` : `Create ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> New {userType}s can login with their email and password. Share these credentials securely with the user.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageUsers;
