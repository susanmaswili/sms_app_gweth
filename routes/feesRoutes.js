import Fee from "../models/fee.js";
import Student from "../models/student.js";
import { Parser } from "json2csv";

export default async function feeRoutes(fastify, options) {
  // Associate Student model
  Fee.belongsTo(Student, { foreignKey: "student_id", as: "student" });

  fastify.post("/fees", async (req, reply) => {
    try {
      const fee = await Fee.create(req.body);
      reply.code(201).send({ message: "✅ Fee payment recorded successfully!", fee });
    } catch (error) {
      console.error("❌ Error recording fee payment:", error.message);
      reply.code(400).send({ error: "Failed to record fee payment.", details: error.message });
    }
  });

  fastify.put("/fees/:id", async (req, reply) => {
    try {
      const fee = await Fee.findByPk(req.params.id);
      if (!fee) {
        return reply.code(404).send({ error: "Fee payment not found." });
      }
  
      const { amount, term, year, date_paid, student_id } = req.body;
      await fee.update({ amount, term, year, date_paid, student_id });
  
      reply.send({ message: "✅ Fee payment updated successfully!", fee });
    } catch (error) {
      console.error("❌ Error updating fee payment:", error.message);
      reply.code(400).send({ error: "Failed to update fee payment.", details: error.message });
    }
  });
  

  fastify.get("/fees", async (req, reply) => {
    try {
      const { student_id, term, year, sortBy, order } = req.query;
      const where = {};
      if (student_id) where.student_id = student_id;
      if (term) where.term = term;
      if (year) where.year = year;

      const fees = await Fee.findAll({
        where,
        include: [{ model: Student, as: "student" }],
        order: [[sortBy || "date_paid", order || "DESC"]],
      });

      reply.send({ message: "✅ Fee payments retrieved successfully!", fees });
    } catch (error) {
      console.error("❌ Error fetching fee payments:", error.message);
      reply.code(500).send({ error: "Failed to retrieve fee payments.", details: error.message });
    }
  });

  fastify.delete("/fees/:id", async (req, reply) => {
    try {
      const { id } = req.params;
      const deleted = await Fee.destroy({ where: { id } });

      if (deleted) {
        reply.send({ message: `✅ Fee payment with ID ${id} deleted successfully!` });
      } else {
        reply.code(404).send({ error: `❌ Fee payment with ID ${id} not found.` });
      }
    } catch (error) {
      console.error("❌ Error deleting fee payment:", error.message);
      reply.code(500).send({ error: "Failed to delete fee payment.", details: error.message });
    }
  });
  // Download Fees CSV per Student
fastify.get("/fees/download/:student_id", async (req, reply) => {
  try {
    const { student_id } = req.params;

    const fees = await Fee.findAll({
      where: { student_id },
      include: [{ model: Student, attributes: ['firstname', 'lastname', 'school', 'class'] }],
      order: [["date_paid", "DESC"]],
    });

    const plainData = fees.map(f => ({
      Student: `${f.Student.firstname} ${f.Student.lastname}`,
      School: f.Student.school,
      Class: f.Student.class,
      Amount: f.amount,
      Term: f.term,
      Year: f.year,
      "Date Paid": f.date_paid
    }));

    const parser = new Parser();
    const csv = parser.parse(plainData);

    reply
      .header("Content-Type", "text/csv")
      .header("Content-Disposition", `attachment; filename=fee_records_student_${student_id}.csv`)
      .send(csv);

  } catch (error) {
    console.error("❌ Error downloading fee records:", error.message);
    reply.code(500).send({ error: "Failed to download fee records.", details: error.message });
  }
});

}
