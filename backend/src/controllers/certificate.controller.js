import { Certificate } from "../models/certificate.model.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import { generateCertificate } from "../services/certificateServices.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// ISSUE CERTIFICATE (ADMIN)
export const issueCertificate = async (req, res) => {
  try {
    const { studentId, course } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!studentId || !course) {
      return res.status(400).json({ message: "studentId and course required" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    const certificateId = crypto.randomBytes(6).toString("hex");

    // Create certificate in DB
    const certificate = await Certificate.create({
      certificateId,
      student: studentId,
      course,
      issuedBy: new mongoose.Types.ObjectId(req.user.id),
      status: "active",
      issueDate: new Date()
    });

    // Generate PDF and update certificate URL
    const populatedCert = await Certificate.findById(certificate._id)
      .populate("student", "name email")
      .populate("issuedBy", "name");

    const certificateUrl = await generateCertificate(populatedCert);
    console.log("Generated certificate URL:", certificateUrl);

    certificate.certificateUrl = certificateUrl;
    const savedCert = await certificate.save();
    console.log("Saved certificate with URL:", savedCert.certificateUrl);

    res.status(201).json({
      message: "Certificate issued successfully",
      certificateId: certificate.certificateId,
      certificateUrl, // <-- frontend can use this
    });

  } catch (error) {
    console.error("Issue certificate error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// VERIFY CERTIFICATE (PUBLIC)
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.body;

    // Try to fetch certificate with populated relations
    let certificate = await Certificate.findOne({ certificateId })
      .populate({ path: "student", select: "name email" })
      .populate({ path: "issuedBy", select: "name email" })
      .lean();

    if (!certificate) {
      return res.status(200).json({ valid: false, message: "Certificate not found" });
    }

    if (!certificate.issuedBy?.name) {
      certificate.issuedBy = { name: "Unknown issuer" }; // fallback
    }


    if (!certificate) {
      return res.status(200).json({ valid: false, message: "Certificate not found" });
    }

    // Ensure we return an issuer name even if populate failed (deleted user or old data)
    let issuerName = null;
    if (certificate.issuedBy && certificate.issuedBy.name) {
      issuerName = certificate.issuedBy.name;
    } else {
      // Try to read raw issuedBy id and look up the user
      const raw = await Certificate.findOne({ certificateId }).select('issuedBy').lean();
      const issuerId = raw?.issuedBy;
      if (issuerId) {
        const user = await User.findById(issuerId).select('name');
        if (user) issuerName = user.name;
      }
    }

    // If we still don't have a name, set a friendly placeholder so frontend shows a value
    if (!issuerName) issuerName = "Unknown issuer";

    // If populate failed, inject a minimal issuedBy object with name so frontend can rely on same path
    if (!certificate.issuedBy || !certificate.issuedBy.name) {
      certificate = certificate.toObject();
      certificate.issuedBy = { name: issuerName };
    }

    res.status(200).json({
      valid: true,
      certificate,
      issuedByName: issuerName,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// STUDENT: get my certificates
export const getMyCertificates = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const certificates = await Certificate.find({ student: req.user.id })
      .populate("issuedBy", "name email")   // <- important
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    console.log("Fetched my certificates:", certificates.length, certificates[0]?.certificateUrl);
    res.status(200).json({ certificates }); // return as { certificates: [...] } for frontend consistency
  } catch (error) {
    console.error("Get my certificates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ADMIN: get all certificates
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("student", "name email")
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 });

    console.log("Fetched all certificates:", certificates.length, certificates[0]?.certificateUrl);
    res.status(200).json({ certificates }); // return as { certificates: [...] } for frontend consistency
  } catch (error) {
    console.error("Get all certificates error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Serve certificate PDF by certificateId (public)
export const serveCertificateFile = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const filePath = path.join(
      process.cwd(),
      "public",
      "certificates",
      `${certificateId}.pdf`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    return res.sendFile(filePath);

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


// ADMIN: Backfill certificateUrl for existing certificates (admin only)
export const backfillCertificateUrls = async (req, res) => {
  try {
    const certs = await Certificate.find({ $or: [{ certificateUrl: { $exists: false } }, { certificateUrl: null }] });
    let updated = 0;
    for (const c of certs) {
      const filePath = path.join(process.cwd(), 'public', 'certificates', `${c.certificateId || c._id}.pdf`);
      if (fs.existsSync(filePath)) {
        c.certificateUrl = `/certificates/${c.certificateId || c._id}.pdf`;
        await c.save();
        updated++;
      }
    }
    res.status(200).json({ message: 'Backfill complete', total: certs.length, updated });
  } catch (err) {
    console.error('Backfill error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DOWNLOAD certificate (forces download)
export const downloadCertificateFile = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const filePath = path.join(process.cwd(), "public", "certificates", `${certificateId}.pdf`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.download(filePath, `${certificateId}.pdf`);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};