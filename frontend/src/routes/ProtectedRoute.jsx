import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

/**
 * Decode JWT payload (no signature verification)
 * Only used for expiration check – backend verifies signature
 */
const decodeJwt = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};

/**
 * Validate token expiration
 */
const isTokenValid = (token) => {
  const decoded = decodeJwt(token);

  if (!decoded) return false;

  if (decoded.exp && decoded.exp < Date.now() / 1000) {
    return false;
  }

  return true;
};

const ProtectedRoute = ({ children, role }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAccess = () => {
      const token = localStorage.getItem("token");
      // Prefer explicit stored role, but fall back to token payload
      let storedRole = localStorage.getItem("role")?.toLowerCase();
      const requiredRole = role?.toLowerCase();

      if (!storedRole && token) {
        const decoded = decodeJwt(token);
        if (decoded?.role) {
          storedRole = String(decoded.role).toLowerCase();
          try {
            localStorage.setItem("role", storedRole);
          } catch (e) {
            // ignore storage errors
          }
        }
      }

      console.log("ProtectedRoute DEBUG:", {
        token,
        storedRole,
        requiredRole,
      });

      // 1. Token must exist
      if (!token) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // 2. Token must be valid (not expired)
      if (!isTokenValid(token)) {
        console.log("Token expired or invalid");

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // 3. Role must match
      if (requiredRole && storedRole !== requiredRole) {
        console.log(
          `Role mismatch: have "${storedRole}", need "${requiredRole}"`
        );

        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // 4. All good
      setIsAuthorized(true);
      setIsLoading(false);
    };

    validateAccess();
  }, [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
