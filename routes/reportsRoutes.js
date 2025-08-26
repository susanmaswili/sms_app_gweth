import fs from "fs";
import path from "path";
import Student from "../models/student.js";
import Fee from "../models/fee.js";
import Grade from "../models/grade.js";
import Report from "../models/report.js";
import { generatePDF } from "../utils/generatePDF.js";
import { generateExcel } from "../utils/generateExcel.js";
import mime from "mime-types"; // You can install this with `npm install mime-types`

export default async function reportRoutes(fastify, options) {
  fastify.post("/reports", async (req, reply) => {
    try {
      const { student_id, report_type } = req.body;

      const student = await Student.findByPk(student_id);
      if (!student) {
        return reply.code(404).send({ error: "Student not found" });
      }

      const fees = await Fee.findAll({ where: { student_id } });
      const grades = await Grade.findAll({ where: { student_id } });

      const reportsDir = path.join("reports");
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
      }

      const filePath = path.join(reportsDir, `report_${student_id}.${report_type === "PDF" ? "pdf" : "xlsx"}`);

      if (report_type === "PDF") {
        await generatePDF(student, fees, grades, filePath);
      } else if (report_type === "Excel") {
        await generateExcel(student, fees, grades, filePath);
      } else {
        return reply.code(400).send({ error: "Invalid report type. Use 'PDF' or 'Excel'." });
      }

      const report = await Report.create({ student_id, report_type, file_path: filePath });

      reply.code(201).send({ message: "✅ Report generated successfully!", report });
    } catch (error) {
      console.error("❌ Error generating report:", error.message);
      reply.code(500).send({ error: "Failed to generate report.", details: error.message });
    }
  });

  fastify.get("/reports/:id/download", async (req, reply) => {
    try {
      const report = await Report.findByPk(req.params.id);
      if (!report) {
        return reply.code(404).send({ error: "Report not found" });
      }
  
      const ext = path.extname(report.file_path).toLowerCase();
      const contentType =
        ext === ".pdf"
          ? "application/pdf"
          : ext === ".xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/octet-stream";
  
      reply
        .type(contentType)
        .header("Content-Disposition", `attachment; filename=report_${report.id}${ext}`)
        .send(fs.createReadStream(report.file_path));
  
    } catch (error) {
      console.error("❌ Error downloading report:", error.message);
      reply.code(500).send({ error: "Failed to download report." });
    }
  });
  
  fastify.get("/reports", async (req, reply) => {
    try {
      const reports = await Report.findAll({
        include: [
          {
            model: Student,
            as: "student", // ensure this matches your association alias if you used one
            attributes: ["firstname", "lastname", "school", "class"]
          }
        ],
        order: [["generated_at", "DESC"]]
      });
  
      reply.send({ message: "✅ Reports retrieved successfully!", reports });
    } catch (error) {
      console.error("❌ Error fetching reports:", error.message);
      reply.code(500).send({ error: "Failed to retrieve reports.", details: error.message });
    }
  });
}
