import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateCertificate = async (certificate) => {
  try {
    const certDir = path.join(process.cwd(), "public", "certificates");

    await fs.promises.mkdir(certDir, { recursive: true });

    const filePath = path.join(certDir, `${certificate.certificateId}.pdf`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Simple certificate design
    doc
      .fontSize(30)
      .text("Certificate of Completion", { align: "center" })
      .moveDown(2);

    doc
      .fontSize(20)
      .text(`This is to certify that`, { align: "center" })
      .moveDown(1);

    doc
      .fontSize(25)
      .text(`${certificate.student?.name || "Student"}`, { align: "center", underline: true })
      .moveDown(1);

    doc
      .fontSize(20)
      .text(`has successfully completed the course`, { align: "center" })
      .moveDown(1);

    doc
      .fontSize(25)
      .text(`${certificate.course || "Course"}`, { align: "center", underline: true })
      .moveDown(2);

    doc
      .fontSize(16)
      .text(`Issued by: ${certificate.issuedBy?.name || "Issuer"}`, { align: "left" })
      .text(`Date: ${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}`, { align: "left" });

    doc.end();

    // Wait for the write stream to finish to ensure file is fully written
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const url = `/certificates/${certificate.certificateId}.pdf`;
    return url;
  } catch (err) {
    console.error("Generate certificate error:", err);
    throw err;
  }
};
