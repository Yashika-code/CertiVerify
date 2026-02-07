import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import IssueCertificate from "./pages/admin/IssueCertificate";
import AllCertificates from "./pages/admin/AllCertificates";
import ManageUsers from "./pages/admin/ManageUsers";

import StudentDashboard from "./pages/student/StudentDashboard";
import ViewCertificates from "./pages/student/ViewCertificates";

import VerifyCertificate from "./pages/verifier/VerifyCertificate";

import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/issue"
        element={
          <ProtectedRoute role="admin">
            <IssueCertificate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/certificates"
        element={
          <ProtectedRoute role="admin">
            <AllCertificates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-users"
        element={
          <ProtectedRoute role="admin">
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      {/* STUDENT */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/viewCertificate"
        element={
          <ProtectedRoute role="student">
            <ViewCertificates />
          </ProtectedRoute>
        }
      />

      {/* VERIFIER */}
      <Route
        path="/verify"
        element={
          <ProtectedRoute role="verifier">
            <VerifyCertificate />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
