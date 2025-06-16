const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

// Generate payroll CSV for bank transfers
const generatePayrollCSV = async (payrolls) => {
  return new Promise((resolve, reject) => {
    try {
      const csvData = payrolls.map(payroll => ({
        employeeId: payroll.employee.employeeId,
        employeeName: `${payroll.employee.personalInfo.firstName} ${payroll.employee.personalInfo.lastName}`,
        accountNumber: payroll.employee.salaryDetails.bankDetails?.accountNumber || '',
        bankName: payroll.employee.salaryDetails.bankDetails?.bankName || '',
        routingNumber: payroll.employee.salaryDetails.bankDetails?.routingNumber || '',
        amount: payroll.netSalary.toFixed(2),
        currency: payroll.employee.salaryDetails.currency || 'USD',
        payPeriod: `${payroll.payPeriod.month}/${payroll.payPeriod.year}`,
        status: payroll.status
      }));

      // Convert to CSV string
      const headers = [
        'Employee ID',
        'Employee Name',
        'Account Number',
        'Bank Name',
        'Routing Number',
        'Amount',
        'Currency',
        'Pay Period',
        'Status'
      ];

      let csvContent = headers.join(',') + '\n';
      
      csvData.forEach(row => {
        const values = [
          row.employeeId,
          `"${row.employeeName}"`,
          row.accountNumber,
          `"${row.bankName}"`,
          row.routingNumber,
          row.amount,
          row.currency,
          row.payPeriod,
          row.status
        ];
        csvContent += values.join(',') + '\n';
      });

      resolve(Buffer.from(csvContent, 'utf8'));
    } catch (error) {
      reject(error);
    }
  });
};

// Generate employee CSV export
const generateEmployeeCSV = async (employees) => {
  return new Promise((resolve, reject) => {
    try {
      const csvData = employees.map(employee => ({
        employeeId: employee.employeeId,
        firstName: employee.personalInfo.firstName,
        lastName: employee.personalInfo.lastName,
        email: employee.userId?.email || '',
        department: employee.employmentDetails.department,
        position: employee.employmentDetails.position,
        type: employee.employmentDetails.type,
        joiningDate: employee.employmentDetails.joiningDate.toISOString().split('T')[0],
        baseSalary: employee.salaryDetails.baseSalary,
        currency: employee.salaryDetails.currency,
        isActive: employee.isActive ? 'Yes' : 'No'
      }));

      const headers = [
        'Employee ID',
        'First Name',
        'Last Name',
        'Email',
        'Department',
        'Position',
        'Type',
        'Joining Date',
        'Base Salary',
        'Currency',
        'Active'
      ];

      let csvContent = headers.join(',') + '\n';
      
      csvData.forEach(row => {
        const values = [
          row.employeeId,
          `"${row.firstName}"`,
          `"${row.lastName}"`,
          row.email,
          `"${row.department}"`,
          `"${row.position}"`,
          row.type,
          row.joiningDate,
          row.baseSalary,
          row.currency,
          row.isActive
        ];
        csvContent += values.join(',') + '\n';
      });

      resolve(Buffer.from(csvContent, 'utf8'));
    } catch (error) {
      reject(error);
    }
  });
};

// Generate attendance CSV export
const generateAttendanceCSV = async (attendanceRecords) => {
  return new Promise((resolve, reject) => {
    try {
      const csvData = attendanceRecords.map(record => ({
        employeeId: record.employee.employeeId || '',
        employeeName: record.employee.personalInfo ? 
          `${record.employee.personalInfo.firstName} ${record.employee.personalInfo.lastName}` : '',
        date: record.date.toISOString().split('T')[0],
        checkIn: record.checkIn.toISOString(),
        checkOut: record.checkOut ? record.checkOut.toISOString() : '',
        totalHours: record.totalHours.toFixed(2),
        overtimeHours: record.overtimeHours.toFixed(2),
        status: record.status
      }));

      const headers = [
        'Employee ID',
        'Employee Name',
        'Date',
        'Check In',
        'Check Out',
        'Total Hours',
        'Overtime Hours',
        'Status'
      ];

      let csvContent = headers.join(',') + '\n';
      
      csvData.forEach(row => {
        const values = [
          row.employeeId,
          `"${row.employeeName}"`,
          row.date,
          row.checkIn,
          row.checkOut,
          row.totalHours,
          row.overtimeHours,
          row.status
        ];
        csvContent += values.join(',') + '\n';
      });

      resolve(Buffer.from(csvContent, 'utf8'));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePayrollCSV,
  generateEmployeeCSV,
  generateAttendanceCSV
};