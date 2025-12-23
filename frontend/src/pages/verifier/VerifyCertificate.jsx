import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { certificateAPI, authAPI } from "../../services/api";

const VerifyCertificate = () => {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  const backendOrigin = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api$/, "");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) return setUserName(storedName);

    const token = localStorage.getItem("token");
    if (!token) return;

    authAPI.getCurrentUser()
      .then(res => {
        const name = res.data?.user?.name;
        if (name) {
          setUserName(name);
          localStorage.setItem("userName", name);
        }
      }).catch(() => {});
  }, []);

  const handleVerify = async () => {
    if (!certId.trim()) {
      setError("Please enter a certificate ID");
      setResult(null);
      return;
    }

    try {
      const res = await certificateAPI.verify(certId.trim());
      setResult(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar dashboard="Certificate Verification" post="Verifier" user={userName} />

      <div className="flex py-20 justify-center items-center h-full p-6">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center">Verify Certificate</h1>
          <input
            type="text"
            placeholder="Certificate ID"
            className="w-full border rounded-md px-4 py-2 mb-4"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded-md" onClick={handleVerify}>
            Verify
          </button>

          {error && <p className="text-red-600 mt-4">{error}</p>}

          {result?.valid && (
            <div className="mt-4 p-4 bg-green-100 rounded space-y-1">
              <p className="font-semibold text-green-800">Certificate is valid ✅</p>
              <p><strong>Course:</strong> {result.certificate?.course}</p>
              <p><strong>Issued to:</strong> {result.certificate?.student?.name}</p>
              <p><strong>Issued by:</strong> {result.certificate?.issuedBy?.name || result.issuedByName}</p>
              <p><strong>Date:</strong> {new Date(result.certificate.issueDate).toLocaleDateString()}</p>
              <p><strong>Certificate ID:</strong> {result.certificate.certificateId}</p>

              {result.certificate?.certificateUrl && (
                <button
                  className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `${backendOrigin}${result.certificate.certificateUrl}`;
                    link.download = `${result.certificate.certificateId}.pdf`;
                    link.click();
                  }}
                >
                  📥 Download Certificate
                </button>
              )}
            </div>
          )}

          {result?.valid === false && (
            <div className="mt-4 p-4 bg-red-100 rounded">
              <p className="font-semibold text-red-800">Certificate is invalid ❌</p>
              <p>{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
