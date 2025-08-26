import Grade from "../models/grade.js";
import Student from "../models/student.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Parser } from 'json2csv';


export default async function gradeRoutes(fastify, options) {
  Grade.belongsTo(Student, { foreignKey: "student_id", as: "student" });

  // Create Grade
  fastify.post("/grades", { preHandler: authMiddleware }, async (req, reply) => {
    try {
      const { student_id, term, year, subject, grade } = req.body;

      const newGrade = await Grade.create({ student_id, term, year, subject, grade });
      reply.code(201).send({ message: "✅ Grade recorded successfully!", grade: newGrade });
    } catch (error) {
      console.error("❌ Error recording grade:", error.message);
      reply.code(400).send({ error: "Failed to record grade.", details: error.message });
    }
  });

  // Get all Grades
  fastify.get("/grades", async (req, reply) => {
    try {
      const { student_id, term, year, subject, sortBy, order } = req.query;
      const where = {};

      if (student_id) where.student_id = student_id;
      if (term) where.term = term;
      if (year) where.year = year;
      if (subject) where.subject = subject;

      const grades = await Grade.findAll({
        where,
        include: [{ model: Student, as: "student" }],
        order: [[sortBy || "term", order || "ASC"]],
      });

      reply.send({ message: "✅ Grades retrieved successfully!", grades });
    } catch (error) {
      console.error("❌ Error fetching grades:", error.message);
      reply.code(500).send({ error: "Failed to retrieve grades.", details: error.message });
    }
  });

  // Update Grade
  fastify.put("/grades/:id", { preHandler: authMiddleware }, async (req, reply) => {
    try {
      const grade = await Grade.findByPk(req.params.id);
      if (!grade) {
        return reply.code(404).send({ error: "Grade not found" });
      }

      const { term, year, subject, grade: value, student_id } = req.body;
      await grade.update({ term, year, subject, grade: value, student_id });

      reply.send({ message: "✅ Grade updated successfully!", grade });
    } catch (error) {
      console.error("❌ Error updating grade:", error.message);
      reply.code(400).send({ error: "Failed to update grade.", details: error.message });
    }
  });

  // Delete Grade
  fastify.delete("/grades/:id", { preHandler: authMiddleware }, async (req, reply) => {
    try {
      const { id } = req.params;
      const deleted = await Grade.destroy({ where: { id } });

      if (deleted) {
        reply.send({ message: `✅ Grade with ID ${id} deleted successfully!` });
      } else {
        reply.code(404).send({ error: `❌ Grade with ID ${id} not found.` });
      }
    } catch (error) {
      console.error("❌ Error deleting grade:", error.message);
      reply.code(500).send({ error: "Failed to delete grade.", details: error.message });
    }
  });
  // Download Grades by Student (CSV)
fastify.get("/grades/download/:student_id", async (req, reply) => {
  try {
    const { student_id } = req.params;

    const grades = await Grade.findAll({
      where: { student_id },
      include: [{ model: Student, as: "student" }],
      order: [["year", "ASC"], ["term", "ASC"]],
    });

    if (!grades.length) {
      return reply.code(404).send({ error: "No grades found for the student." });
    }

    const mappedGrades = grades.map(g => ({
      Name: `${g.student.firstname} ${g.student.lastname}`,
      Class: g.student.class,
      School: g.student.school,
      Term: g.term,
      Year: g.year,
      Subject: g.subject,
      Grade: g.grade
    }));

    const parser = new Parser();
    const csv = parser.parse(mappedGrades);

    reply
      .header("Content-Type", "text/csv")
      .header("Content-Disposition", `attachment; filename=grades-student-${student_id}.csv`)
      .send(csv);
  } catch (error) {
    console.error("❌ Error downloading grades:", error.message);
    reply.code(500).send({ error: "Failed to download grades." });
  }
});
}
