import ExcelJS from "exceljs";

export const generateExcel = async (student, fees, grades, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Student Report");

  const fullName = `${student.firstname} ${student.middlename} ${student.lastname}`;

  sheet.columns = [
    { header: "Section", key: "section", width: 25 },
    { header: "Details", key: "details", width: 50 },
  ];

  sheet.addRow({ section: "Student Name", details: fullName });
  sheet.addRow({ section: "School", details: student.school });
  sheet.addRow({ section: "Class", details: student.class });
  sheet.addRow({ section: "", details: "" });

  // Fees Section
  sheet.addRow({ section: "School Fees Payments", details: "" });
  if (fees.length === 0) {
    sheet.addRow({ section: "-", details: "No fee records available." });
  } else {
    fees.forEach((fee, index) => {
      sheet.addRow({
        section: `${index + 1}. ${fee.amount}`,
        details: `Paid on ${fee.date_paid} (Term: ${fee.term}, Year: ${fee.year})`,
      });
    });
  }

  sheet.addRow({ section: "", details: "" });

  // Grades Section
  sheet.addRow({ section: "Termly Grades", details: "" });
  if (grades.length === 0) {
    sheet.addRow({ section: "-", details: "No grade records available." });
  } else {
    grades.forEach((grade, index) => {
      sheet.addRow({
        section: `${index + 1}. ${grade.subject}`,
        details: `${grade.grade} (Term: ${grade.term}, Year: ${grade.year})`,
      });
    });
  }

  await workbook.xlsx.writeFile(filePath);
  return filePath;
};
