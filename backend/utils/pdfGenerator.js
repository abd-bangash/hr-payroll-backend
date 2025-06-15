const PDFDocument = require('pdfkit');

// Generate payslip PDF (placeholder implementation)
const generatePayslipPDF = async (payroll) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('PAYSLIP', 50, 50);
      doc.fontSize(12).text(`Employee ID: ${payroll.employee.employeeId}`, 50, 80);
      doc.text(`Name: ${payroll.employee.personalInfo.firstName} ${payroll.employee.personalInfo.lastName}`, 50, 100);
      doc.text(`Department: ${payroll.employee.employmentDetails.department}`, 50, 120);
      doc.text(`Pay Period: ${payroll.payPeriod.month}/${payroll.payPeriod.year}`, 50, 140);

      // Earnings section
      doc.fontSize(14).text('EARNINGS', 50, 180);
      doc.fontSize(10);
      doc.text(`Base Salary: $${payroll.earnings.baseSalary.toFixed(2)}`, 50, 200);
      doc.text(`Overtime: $${payroll.earnings.overtime.toFixed(2)}`, 50, 220);
      doc.text(`Bonus: $${payroll.earnings.bonus.toFixed(2)}`, 50, 240);
      doc.text(`Commission: $${payroll.earnings.commission.toFixed(2)}`, 50, 260);
      doc.text(`Allowances: $${payroll.earnings.allowances.toFixed(2)}`, 50, 280);
      doc.fontSize(12).text(`Total Earnings: $${payroll.earnings.totalEarnings.toFixed(2)}`, 50, 300);

      // Deductions section
      doc.fontSize(14).text('DEDUCTIONS', 300, 180);
      doc.fontSize(10);
      doc.text(`Tax: $${payroll.deductions.tax.toFixed(2)}`, 300, 200);
      doc.text(`Social Security: $${payroll.deductions.socialSecurity.toFixed(2)}`, 300, 220);
      doc.text(`Health Insurance: $${payroll.deductions.healthInsurance.toFixed(2)}`, 300, 240);
      doc.text(`Retirement: $${payroll.deductions.retirementContribution.toFixed(2)}`, 300, 260);
      doc.text(`Other: $${payroll.deductions.otherDeductions.toFixed(2)}`, 300, 280);
      doc.fontSize(12).text(`Total Deductions: $${payroll.deductions.totalDeductions.toFixed(2)}`, 300, 300);

      // Net salary
      doc.fontSize(16).text(`NET SALARY: $${payroll.netSalary.toFixed(2)}`, 50, 350);

      // Footer
      doc.fontSize(8).text('This is a computer-generated payslip and does not require a signature.', 50, 500);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 520);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate employee report PDF
const generateEmployeeReportPDF = async (employees) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('EMPLOYEE REPORT', 50, 50);
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);
      doc.text(`Total Employees: ${employees.length}`, 50, 100);

      let yPosition = 140;

      employees.forEach((employee, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(10);
        doc.text(`${index + 1}. ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`, 50, yPosition);
        doc.text(`ID: ${employee.employeeId}`, 200, yPosition);
        doc.text(`Department: ${employee.employmentDetails.department}`, 300, yPosition);
        doc.text(`Type: ${employee.employmentDetails.type}`, 450, yPosition);
        
        yPosition += 20;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePayslipPDF,
  generateEmployeeReportPDF
};