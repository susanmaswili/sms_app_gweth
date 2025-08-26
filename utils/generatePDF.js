import PDFDocument from "pdfkit";
import fs from "fs";

export const generatePDF = async (student, fees, grades, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const fullName = `${student.firstname} ${student.middlename} ${student.lastname}`;

    doc.fontSize(18).text("Student Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${fullName}`);
    doc.text(`School: ${student.school}`);
    doc.text(`Class: ${student.class}`);
    doc.moveDown();
    
    // Fees Section
    doc.fontSize(16).text("School Fees Payments:");
    if (fees.length === 0) {
      doc.text("No fee records available.");
    } else {
      fees.forEach((fee, index) => {
        doc.text(`${index + 1}. ${fee.amount} paid on ${fee.date_paid} (Term: ${fee.term}, Year: ${fee.year})`);
      });
    }
    doc.moveDown();

    // Grades Section
    doc.fontSize(16).text("Termly Grades:");
    if (grades.length === 0) {
      doc.text("No grade records available.");
    } else {
      grades.forEach((grade, index) => {
        doc.text(`${index + 1}. ${grade.subject}: ${grade.grade} (Term: ${grade.term}, Year: ${grade.year})`);
      });
    }

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};
