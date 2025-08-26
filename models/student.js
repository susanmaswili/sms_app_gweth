import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Student = sequelize.define("Student", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstname: { type: DataTypes.STRING, allowNull: false },
  middlename: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: false },
  school: { type: DataTypes.STRING, allowNull: false },
  class: { type: DataTypes.STRING, allowNull: false },
  mothername: { type: DataTypes.STRING, allowNull: false },
  fathername: { type: DataTypes.STRING, allowNull: false },
  guardianname: { type: DataTypes.STRING, allowNull: false },
  phonenumber: { type: DataTypes.INTEGER, allowNull: false },
  villagename: { type: DataTypes.STRING, allowNull: false },
  photo: { type: DataTypes.STRING }, // URL or base64
  history: { type: DataTypes.TEXT }, // Student background
  status: { 
    type: DataTypes.ENUM('Active', 'Inactive'), 
    defaultValue: 'Active' 
  },
}, { timestamps: true });

// Associations
import Grade from "./grade.js";
import Fee from "./fee.js";
import Report from "./report.js";

Student.hasMany(Grade, { foreignKey: "student_id", onDelete: "CASCADE" });
Grade.belongsTo(Student, { foreignKey: "student_id" });

Student.hasMany(Fee, { foreignKey: "student_id", onDelete: "CASCADE" });
Fee.belongsTo(Student, { foreignKey: "student_id" });

Student.hasMany(Report, { foreignKey: "student_id", onDelete: "CASCADE" });
Report.belongsTo(Student, { foreignKey: "student_id", as: "student" }); // <-- alias is "student"

export default Student;

