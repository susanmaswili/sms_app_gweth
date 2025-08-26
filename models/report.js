import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Report = sequelize.define("Report", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  report_type: { type: DataTypes.STRING, allowNull: false }, // PDF / Excel
  generated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  file_path: { type: DataTypes.STRING, allowNull: false },
});

export default Report;
