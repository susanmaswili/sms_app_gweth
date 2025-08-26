import Student from '../models/student.js';
//import { upload } from "../utils/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Parser } from 'json2csv';

const pump = promisify(pipeline);

// Ensure uploads dir exists
const uploadDir = './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export default async function studentRoutes(fastify, options) {

  // Create a new student
  fastify.post('/students', { preHandler: authMiddleware }, async (req, reply) => {
    try {
      const parts = req.parts();
      const form = {};
      let photoPath = null;

      for await (const part of parts) {
        if (part.file) {
          const ext = path.extname(part.filename);
          const uniqueName = `photo-${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
          const filePath = path.join(uploadDir, uniqueName);
          const writeStream = fs.createWriteStream(filePath);
          await pump(part.file, writeStream); // ✅ This is the correct way
          photoPath = `/uploads/${uniqueName}`;
        } else {
          form[part.fieldname] = part.value;
        }
      }

      const student = await Student.create({
        firstname: form.firstname || '',
        middlename: form.middlename || '',
        lastname: form.lastname || '',
        school: form.school || '',
        class: form.class || '',
        mothername: form.mothername || '',
        fathername: form.fathername || '',
        guardianname: form.guardianname || '',
        phonenumber: form.phonenumber || '',
        villagename: form.villagename || '',
        history: form.history || '',
        status: form.status || 'Inactive',
        photo: photoPath
      });

      reply.code(201).send({ message: '✅ Student created successfully!', student });

    } catch (error) {
      console.error('❌ Error creating student:', error.message);
      reply.code(500).send({ error: 'Failed to create student.', details: error.message });
    }
  });

  // Get all students
  fastify.get("/students",{ preHandler: authMiddleware }, async (req, reply) => {
    try {
      const { firstname, middlename, lastname, school, class: studentClass, mothername, fathername, guardianname, phonenumber, villagename, history, status, sortBy, order } = req.query;
      const where = {};
      if (status) where.status = status;
      if (school) where.school = school;
      if (studentClass) where.class = studentClass;

      const students = await Student.findAll({
        where,
        order: [[sortBy || "createdAt", order || "DESC"]], // Default: Newest first
      });

      reply.send({ message: "✅ Students retrieved successfully!", students });
    } catch (error) {
      console.error("❌ Error fetching students:", error.message);
      reply.code(500).send({ error: "Failed to retrieve students.", details: error.message });
    }
  });

  // Get a student by ID
  fastify.get('/students/:id', async (request, reply) => {
    try {
      console.log(`📥 Received GET /students/${request.params.id}`);
      const student = await Student.findByPk(request.params.id);
      if (!student) {
        console.warn("⚠️ Student not found with ID:", request.params.id);
        return reply.code(404).send({ error: "Student not found" });
      }
      console.log("✅ Student retrieved:", student.toJSON());
      reply.send({ message: "Student fetched successfully", student });
    } catch (error) {
      console.error("❌ Error fetching student:", error.message);
      reply.code(500).send({ error: error.message });
    }
  });

  // Update a student by ID
  fastify.put('/students/:id', { preHandler: authMiddleware }, async (req, reply) => {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) {
        return reply.code(404).send({ error: 'Student not found' });
      }
  
      const parts = req.parts();
      const form = {};
      let photoPath = student.photo; // Default to existing photo if no new one
  
      for await (const part of parts) {
        if (part.file) {
          const ext = path.extname(part.filename);
          const uniqueName = `photo-${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
          const filePath = path.join(uploadDir, uniqueName);
          const writeStream = fs.createWriteStream(filePath);
          await pump(part.file, writeStream);
          photoPath = `/uploads/${uniqueName}`;
        } else {
          form[part.fieldname] = part.value;
        }
      }
  
      await student.update({
        firstname: form.firstname || student.firstname,
        middlename: form.middlename || student.middlename,
        lastname: form.lastname || student.lastname,
        school: form.school || student.school,
        class: form.class || student.class,
        mothername: form.mothername || student.mothername,
        fathername: form.fathername || student.fathername,
        guardianname: form.guardianname || student.guardianname,
        phonenumber: form.phonenumber || student.phonenumber,
        villagename: form.villagename || student.villagename,
        history: form.history || student.history,
        status: form.status || student.status,
        photo: photoPath
      });
  
      reply.send({ message: '✅ Student updated successfully!', student });
    } catch (error) {
      console.error('❌ Error updating student:', error.message);
      reply.code(500).send({ error: 'Failed to update student.', details: error.message });
    }
  });
  
  // Delete a student by ID
  fastify.delete('/students/:id', async (request, reply) => {
    try {
      console.log(`🗑️ Received DELETE /students/${request.params.id}`);
      const student = await Student.findByPk(request.params.id);
      if (!student) {
        console.warn("⚠️ Student not found with ID:", request.params.id);
        return reply.code(404).send({ error: "Student not found" });
      }
      await student.destroy();
      console.log("✅ Student deleted successfully:", student.toJSON());
      reply.send({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting student:", error.message);
      reply.code(500).send({ error: error.message });
    }
  });
  fastify.get('/students/download', async (req, reply) => {
    try {
      const students = await Student.findAll();
  
      const fields = [
        'firstname', 'middlename', 'lastname', 'school',
        'class', 'mothername', 'fathername', 'guardianname',
        'phonenumber', 'villagename', 'status', 'createdAt'
      ];
  
      const parser = new Parser({ fields });
      const csv = parser.parse(students.map(s => s.toJSON()));
  
      reply
        .header('Content-Type', 'text/csv')
        .header('Content-Disposition', 'attachment; filename=students.csv')
        .send(csv);
    } catch (err) {
      console.error("❌ Error downloading students:", err.message);
      reply.code(500).send({ error: "Failed to download students." });
    }
  });
}
