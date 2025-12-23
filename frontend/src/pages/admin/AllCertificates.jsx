import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { certificateAPI } from "../../services/api";
import { LayoutDashboard, FilePlus, Files, Eye, Download } from "lucide-react";

const AllCertificates = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState("");

  const backendOrigin =
    (import.meta.env.VITE_API_URL || "http://localhost:3000").replace("/api", "");

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    certificateAPI.getAll()
      .then(res => setCertificates(res.data.certificates || []));
  }, []);

  const filtered = certificates.filter(c =>
    c.certificateId.toLowerCase().includes(search.toLowerCase()) ||
    (c.student?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    c.course.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">All Certificates</h1>

          <input
            placeholder="Search by ID, course, student..."
            className="border px-4 py-2 rounded mb-4 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[calc(100vh-260px)] overflow-y-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-6 px-4 py-3 bg-gray-50 font-semibold">
                <span>ID</span>
                <span>Student</span>
                <span>Course</span>
                <span>Date</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {filtered.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No certificates found</div>
              ) : (
                filtered.map(cert => (
                  <div
                    key={cert._id}
                    className="grid grid-cols-6 px-4 py-3 border-b text-sm items-center"
                  >
                    <span>{cert.certificateId}</span>
                    <span>{cert.student?.name || "N/A"}</span>
                    <span>{cert.course}</span>
                    <span>{new Date(cert.issueDate).toLocaleDateString()}</span>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold w-fit
                        {(cert.status || "").toLowerCase() === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {cert.status || "Pending"}
                    </span>

                    <div className="flex gap-3">
                      {/* VIEW */}
                      <button
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        onClick={() =>
                          window.open(`${backendOrigin}/${cert.certificateUrl.replace(/^\/+/, '')}`, "_blank")

                        }
                      >
                        <Eye size={14} /> View
                      </button>


                      {/* DOWNLOAD */}
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

export default AllCertificates;
