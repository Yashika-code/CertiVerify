import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute.jsx - Route Protection Component
 * 
 * This component validates JWT tokens and enforces role-based access control.
 * 
 * Security Flow:
 * 1. Check if token exists in localStorage
 * 2. Decode JWT payload to extract role and expiration
 * 3. Validate token signature (note: signature verification requires backend)
 * 4. Check token expiration timestamp
 * 5. Verify user's role matches required route role
 * 6. Clear storage and redirect if any validation fails
 */

/**
 * Decode JWT payload without verification
 * WARNING: This only decodes - it does NOT verify the signature!
 * Token verification should happen on the backend.
 * This is safe for role-based routing since the server validates the token on each request.
 */
const decodeJwt = (token) => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid JWT format: expected 3 parts");
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    
    // Handle URL-safe base64 encoding (replace - with +, _ with /)
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};

/**
 * Check if JWT token is valid and not expired
 */
const isTokenValid = (token) => {
  const decoded = decodeJwt(token);
  
  if (!decoded) {
    console.warn("Failed to decode token");
    return false;
  }

  // Check expiration: exp is in seconds, Date.now() is in milliseconds
  if (decoded.exp && decoded.exp < Date.now() / 1000) {
    console.warn("Token has expired");
    return false;
  }

  return true;
};

/**
 * ProtectedRoute Component
 * 
 * Props:
 *   - children: React component to render if authorized
 *   - role: Required role for this route (e.g., "admin", "student", "verifier")
 * 
 * Returns:
 *   - children if user is authenticated with correct role
 *   - Navigate to "/" if unauthenticated, token invalid, or role mismatch
 */
const ProtectedRoute = ({ children, role }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAccess = () => {
      // Step 1: Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Step 2: Validate token (decode + check expiration)
      if (!isTokenValid(token)) {
        console.log("Token invalid or expired");
        // Clear corrupted/expired token
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Step 3: Decode token to get role
      const decoded = decodeJwt(token);
      if (!decoded || !decoded.role) {
        console.log("No role found in token");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Step 4: Check role matches required role for this route
      if (role && decoded.role !== role) {
        console.log(`Role mismatch: user has "${decoded.role}", route requires "${role}"`);
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // All checks passed
      console.log(`Access granted for role: ${decoded.role}`);
      setIsAuthorized(true);
      setIsLoading(false);
    };

    validateAccess();
  }, [role]);

  // Show loading state while validating
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

  // If not authorized, redirect to login
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // User is authorized - render protected component
  return <>{children}</>;
};

export default ProtectedRoute;
