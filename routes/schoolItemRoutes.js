// routes/schoolItemRoutes.js
import SchoolItem from "../models/schoolItem.js";
import Student from "../models/student.js";
import { Parser } from "json2csv";

export default async function schoolItemRoutes(fastify, options) {
  // Associate with Student
  SchoolItem.belongsTo(Student, { foreignKey: "student_id", as: "student" });

  // ➕ Create new school item
  fastify.post("/school-items", async (req, reply) => {
    try {
      const item = await SchoolItem.create(req.body);
      reply.code(201).send({ message: "✅ School item recorded successfully!", item });
    } catch (error) {
      console.error("❌ Error recording school item:", error.message);
      reply.code(400).send({ error: "Failed to record school item.", details: error.message });
    }
  });

  // ✏️ Update school item
  fastify.put("/school-items/:id", async (req, reply) => {
    try {
      const item = await SchoolItem.findByPk(req.params.id);
      if (!item) {
        return reply.code(404).send({ error: "School item not found." });
      }

      const { item_name, cost, term, year, date_received, student_id } = req.body;
      await item.update({ item_name, cost, term, year, date_received, student_id });

      reply.send({ message: "✅ School item updated successfully!", item });
    } catch (error) {
      console.error("❌ Error updating school item:", error.message);
      reply.code(400).send({ error: "Failed to update school item.", details: error.message });
    }
  });

  // 📖 Get all school items
  fastify.get("/school-items", async (req, reply) => {
    try {
      const { student_id, term, year } = req.query;
      const where = {};
      if (student_id) where.student_id = student_id;
      if (term) where.term = term;
      if (year) where.year = year;

      const items = await SchoolItem.findAll({
        where,
        include: [{ model: Student, as: "student" }],
        order: [["date_received", "DESC"]],
      });

      reply.send({ message: "✅ School items retrieved successfully!", items });
    } catch (error) {
      console.error("❌ Error fetching school items:", error.message);
      reply.code(500).send({ error: "Failed to retrieve school items.", details: error.message });
    }
  });

  // ❌ Delete school item
  fastify.delete("/school-items/:id", async (req, reply) => {
    try {
      const { id } = req.params;
      const deleted = await SchoolItem.destroy({ where: { id } });

      if (deleted) {
        reply.send({ message: `✅ School item with ID ${id} deleted successfully!` });
      } else {
        reply.code(404).send({ error: `❌ School item with ID ${id} not found.` });
      }
    } catch (error) {
      console.error("❌ Error deleting school item:", error.message);
      reply.code(500).send({ error: "Failed to delete school item.", details: error.message });
    }
  });

  // 📥 Download School Items CSV per Student
  fastify.get("/school-items/download/:student_id", async (req, reply) => {
    try {
      const { student_id } = req.params;

      const items = await SchoolItem.findAll({
        where: { student_id },
        include: [{ model: Student, attributes: ["firstname", "lastname", "school", "class"] }],
        order: [["date_received", "DESC"]],
      });

      const plainData = items.map(i => ({
        Student: `${i.student.firstname} ${i.student.lastname}`,
        School: i.student.school,
        Class: i.student.class,
        Item: i.item_name,
        Cost: i.cost,
        Term: i.term,
        Year: i.year,
        "Date Received": i.date_received
      }));

      const parser = new Parser();
      const csv = parser.parse(plainData);

      reply
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", `attachment; filename=school_items_student_${student_id}.csv`)
        .send(csv);

    } catch (error) {
      console.error("❌ Error downloading school item records:", error.message);
      reply.code(500).send({ error: "Failed to download school items.", details: error.message });
    }
  });
}
