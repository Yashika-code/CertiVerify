import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { certificateAPI } from "../../services/api";
import { Download, Eye, FileText } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    certificateAPI.getMyCertificates()
      .then(res => setCertificates(res.data.certificates || []))
      .catch(() => setError("Failed to load certificates"))
      .finally(() => setLoading(false));
  }, []);

  const backendOrigin = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

  return (
    <div className="h-screen bg-gray-100">
      <Navbar dashboard="Certificate Dashboard" post="Student" />

      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">

        {/* SIDEBAR */}
        <aside className="
          flex md:flex-col flex-row
          md:w-64 w-full
          bg-white border-b md:border-r
          p-2 md:p-4
          sticky top-0
          overflow-x-auto
        ">
          <h2 className="hidden md:block text-xl font-semibold mb-6">
            Student Portal
          </h2>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 font-medium whitespace-nowrap md:w-full"
            onClick={() => navigate("/student")}
          >
            <FileText size={18} />
            My Certificates
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 whitespace-nowrap md:w-full md:mt-2 ml-2 md:ml-0"
            onClick={() => navigate("/student/viewCertificate")}
          >
            <Eye size={18} />
            View Certificate
          </button>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">My Certificates</h1>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && certificates.length === 0 && (
            <p className="text-gray-500">No certificates found.</p>
          )}

          <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <div
                  key={cert._id}
                  className="bg-white rounded-xl shadow p-5 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-lg">{cert.course}</h2>
                    <p className="text-sm text-gray-500">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm mt-2">
                      Status: <span className="text-green-600">{cert.status}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {(cert.certificateId || cert._id).slice(-8)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
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
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
