import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { certificateAPI, authAPI } from "../../services/api";
import { LayoutDashboard, FilePlus, Files } from "lucide-react";

const IssueCertificate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    course: "",
  });

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    authAPI.getStudents()
      .then(res => setStudents(res.data.students || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await certificateAPI.issue(formData);
      setSuccess("Certificate Issued Successfully!");
      setFormData({ studentId: "", course: "" });
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to issue certificate";
      setError(errorMsg);
      console.error("Issue error:", err);
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
        </aside>

        {/* FORM */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl shadow max-w-xl">
            <h1 className="text-xl font-semibold mb-4">Issue New Certificate</h1>

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
              <select
                required
                className="w-full border px-4 py-2 rounded"
                value={formData.studentId}
                onChange={e =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                required
                placeholder="Course name"
                className="w-full border px-4 py-2 rounded"
                value={formData.course}
                onChange={e =>
                  setFormData({ ...formData, course: e.target.value })
                }
              />

              <button
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Issuing..." : "Issue Certificate"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IssueCertificate;
