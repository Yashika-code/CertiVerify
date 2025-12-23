import express from "express";
import {
  issueCertificate,
  verifyCertificate,
  getMyCertificates,
  getAllCertificates,  
  serveCertificateFile,
  backfillCertificateUrls,
  downloadCertificateFile,
} from "../controllers/certificate.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Issue certificate (admin only)
router.post("/issue", protect, allowRoles("admin"), issueCertificate);

// Verify certificate (public)
router.post("/verify", verifyCertificate);

// Serve certificate file (public)
router.get("/certificates/:certificateId", serveCertificateFile);

// Admin: backfill certificateUrl for existing certs
router.post("/backfill", protect, allowRoles("admin"), backfillCertificateUrls);

// Student: view my certificates
router.get("/my", protect, allowRoles("student"), getMyCertificates);

// Admin: view all certificates
router.get("/", protect, allowRoles("admin"), getAllCertificates);

router.get("/download/:certificateId", downloadCertificateFile);

export default router;
