import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { certificateAPI } from "../../services/api";
import { Eye, FileText, Download } from "lucide-react";

const ViewCertificates = () => {
  const backendOrigin =
    (import.meta.env.VITE_API_URL || "http://localhost:3000").replace("/api", "");

  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const handleDownload = (certificateUrl, certificateId) => {
    const link = document.createElement("a");
    link.href = `${backendOrigin}${certificateUrl}`;
    link.download = `Certificate-${certificateId}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    certificateAPI.getMyCertificates()
      .then(res => setCertificates(res.data.certificates || []))
      .catch(() => setError("Failed to load certificates"))
      .finally(() => setLoading(false));
  }, []);

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
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 whitespace-nowrap md:w-full"
            onClick={() => navigate("/student")}
          >
            <FileText size={18} />
            My Certificates
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 font-medium whitespace-nowrap md:w-full md:mt-2 ml-2 md:ml-0"
            onClick={() => navigate("/student/viewCertificate")}
          >
            <Eye size={18} />
            View Certificate
          </button>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">All Certificates</h1>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}

          <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-5 px-4 py-3 bg-gray-50 border-b font-semibold">
                <span>ID</span>
                <span>Course</span>
                <span>Issue Date</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {certificates.map(cert => (
                <div
                  key={cert._id}
                  className="grid grid-cols-5 px-4 py-3 border-b text-sm"
                >
                  <span>{(cert.certificateId || cert._id).slice(-6)}</span>
                  <span>{cert.course}</span>
                  <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                  <span className="text-green-600">{cert.status}</span>
                  <span>
                    {cert.certificateUrl ? (
                      <button
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        onClick={() =>
                          window.open(`${backendOrigin}/${cert.certificateUrl.replace(/^\/+/, '')}`, "_blank")

                        }
                      >
                        <Eye size={14} /> View
                      </button>

                    ) : (
                      <span className="text-gray-400">NA</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewCertificates;
