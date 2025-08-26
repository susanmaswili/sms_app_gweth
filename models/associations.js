// models/associations.js
import Student from './student.js';
import Grade from './grade.js';

Student.hasMany(Grade, { foreignKey: 'student_id' });
Grade.belongsTo(Student, { foreignKey: 'student_id' });

export { Student, Grade };
