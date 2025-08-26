import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Fee = sequelize.define("Fee", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  term: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false }, // ✅ Added year field
  date_paid: { type: DataTypes.DATEONLY, allowNull: false },
});

export default Fee;
