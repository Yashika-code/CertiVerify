import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { certificateAPI } from "../../services/api";
import { LayoutDashboard, FilePlus, Files, Eye, Download } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalCertificates: 0,
    activeCertificates: 0,
    totalStudents: 0,
    thisMonth: 0,
  });
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendOrigin =
    (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api$/, "");

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await certificateAPI.getAll();
        const list = res.data.certificates || [];

        const active = list.filter(c => (c.status || "").toLowerCase() === "active").length;
        const students = new Set(list.map(c => c.student?._id)).size;
        const now = new Date();
        const thisMonth = list.filter(c => {
          const d = new Date(c.issueDate);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        setStats({ totalCertificates: list.length, activeCertificates: active, totalStudents: students, thisMonth });
        setCertificates(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="h-screen bg-gray-100">
      <Navbar dashboard="Admin Dashboard" post="Administrator" />

      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
        <aside className="flex md:flex-col flex-row md:w-64 w-full bg-white border-b md:border-r p-2 md:p-4 sticky top-0 overflow-x-auto">
          <button onClick={() => navigate("/admin")} className={`sidebar-btn flex items-center gap-2 md:w-full whitespace-nowrap ${isActive("/admin") ? "bg-green-50 text-green-700" : "hover:bg-gray-100"}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button onClick={() => navigate("/admin/issue")} className={`sidebar-btn flex items-center gap-2 md:w-full whitespace-nowrap ml-2 md:ml-0 ${isActive("/admin/issue") ? "bg-green-50 text-green-700" : "hover:bg-gray-100"}`}>
            <FilePlus size={18} /> Issue Certificate
          </button>

          <button onClick={() => navigate("/admin/certificates")} className={`sidebar-btn flex items-center gap-2 md:w-full whitespace-nowrap ml-2 md:ml-0 ${isActive("/admin/certificates") ? "bg-green-50 text-green-700" : "hover:bg-gray-100"}`}>
            <Files size={18} /> All Certificates
          </button>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Certificates", value: stats.totalCertificates, color: "bg-blue-100" },
              { label: "Active Certificates", value: stats.activeCertificates, color: "bg-green-100" },
              { label: "Total Students", value: stats.totalStudents, color: "bg-purple-100" },
              { label: "This Month", value: stats.thisMonth, color: "bg-orange-100" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                <div className={`p-4 rounded-full text-xl ${s.color}`}>📊</div>
                <div>
                  <h2 className="text-2xl font-bold">{s.value}</h2>
                  <p className="text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-6 px-4 py-3 bg-gray-50 font-semibold">
                <span>ID</span>
                <span>Student</span>
                <span>Course</span>
                <span>Date</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading certificates...</div>
              ) : certificates.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No certificates found</div>
              ) : (
                certificates.map(cert => (
                  <div key={cert._id} className="grid grid-cols-6 px-4 py-3 border-b text-sm items-center">
                    <span>{cert.certificateId}</span>
                    <span>{cert.student?.name || "N/A"}</span>
                    <span>{cert.course}</span>
                    <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${(cert.status || "").toLowerCase() === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {cert.status || "Pending"}
                    </span>
                    <div className="flex gap-3">
                      <button
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        onClick={() =>
                          window.open(`${backendOrigin}/${cert.certificateUrl.replace(/^\/+/, '')}`, "_blank")

                        }
                      >
                        <Eye size={14} /> View
                      </button>

                      {cert.certificateUrl && (
                        <button className="text-green-600 hover:underline flex items-center gap-1"
                          onClick={() => window.open(`${backendOrigin}/api/certificates/download/${cert.certificateId}`, "_blank")}>
                          <Download size={14} /> Download
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
