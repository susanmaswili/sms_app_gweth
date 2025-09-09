// models/schoolItem.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SchoolItem = sequelize.define("SchoolItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false }, // linked to student
  item_name: { type: DataTypes.STRING, allowNull: false }, // e.g. "Books", "Uniform"
  cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  term: { type: DataTypes.STRING, allowNull: false }, // e.g. "Term 1"
  year: { type: DataTypes.INTEGER, allowNull: false },
  date_received: { type: DataTypes.DATEONLY, allowNull: false }
});

export default SchoolItem;
