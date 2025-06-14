const moment = require('moment');

// Calculate payroll based on employee data and input
const calculatePayroll = async (employee, payrollData) => {
  const { payPeriod, earnings, deductions = {} } = payrollData;

  // Calculate tax based on employee's tax rate and earnings
  const calculatedTax = earnings.baseSalary * (employee.taxInfo?.taxRate || 0.2);
  
  // Calculate social security (typically 6.2% in US)
  const socialSecurity = earnings.baseSalary * 0.062;
  
  // Calculate health insurance deduction if employee has coverage
  const healthInsurance = employee.benefits?.healthInsurance ? 200 : 0;
  
  // Calculate retirement contribution (if employee participates)
  const retirementContribution = employee.benefits?.retirementPlan ? earnings.baseSalary * 0.05 : 0;

  return {
    employee: employee._id,
    payPeriod,
    earnings: {
      baseSalary: earnings.baseSalary,
      overtime: earnings.overtime || 0,
      bonus: earnings.bonus || 0,
      commission: earnings.commission || 0,
      allowances: earnings.allowances || 0
    },
    deductions: {
      tax: deductions.tax || calculatedTax,
      socialSecurity: deductions.socialSecurity || socialSecurity,
      healthInsurance: deductions.healthInsurance || healthInsurance,
      retirementContribution: deductions.retirementContribution || retirementContribution,
      otherDeductions: deductions.otherDeductions || 0
    },
    status: 'Draft'
  };
};

// Calculate overtime pay
const calculateOvertimePay = (regularHours, overtimeHours, hourlyRate) => {
  const overtimeRate = hourlyRate * 1.5; // Time and a half
  return overtimeHours * overtimeRate;
};

// Calculate annual salary breakdown
const calculateAnnualBreakdown = (monthlySalary) => {
  return {
    monthly: monthlySalary,
    quarterly: monthlySalary * 3,
    semiAnnual: monthlySalary * 6,
    annual: monthlySalary * 12
  };
};

// Calculate net pay after all deductions
const calculateNetPay = (totalEarnings, totalDeductions) => {
  return Math.max(0, totalEarnings - totalDeductions);
};

// Calculate year-to-date totals
const calculateYTDTotals = async (employeeId, currentYear) => {
  const Payroll = require('../models/Payroll');
  
  const ytdPayrolls = await Payroll.find({
    employee: employeeId,
    'payPeriod.year': currentYear,
    status: { $in: ['Approved', 'Paid'] }
  });

  return ytdPayrolls.reduce((totals, payroll) => {
    totals.earnings += payroll.earnings.totalEarnings;
    totals.deductions += payroll.deductions.totalDeductions;
    totals.netPay += payroll.netSalary;
    return totals;
  }, { earnings: 0, deductions: 0, netPay: 0 });
};

// Validate payroll data
const validatePayrollData = (payrollData) => {
  const errors = [];

  if (!payrollData.employee) {
    errors.push('Employee ID is required');
  }

  if (!payrollData.payPeriod) {
    errors.push('Pay period is required');
  } else {
    if (!payrollData.payPeriod.month || payrollData.payPeriod.month < 1 || payrollData.payPeriod.month > 12) {
      errors.push('Valid month (1-12) is required');
    }
    if (!payrollData.payPeriod.year || payrollData.payPeriod.year < 2020) {
      errors.push('Valid year is required');
    }
  }

  if (!payrollData.earnings || !payrollData.earnings.baseSalary || payrollData.earnings.baseSalary <= 0) {
    errors.push('Valid base salary is required');
  }

  return errors;
};

// Generate pay period dates
const generatePayPeriodDates = (month, year, frequency = 'Monthly') => {
  const startDate = moment({ year, month: month - 1, day: 1 });
  let endDate;

  switch (frequency) {
    case 'Weekly':
      endDate = startDate.clone().add(6, 'days');
      break;
    case 'Bi-weekly':
      endDate = startDate.clone().add(13, 'days');
      break;
    case 'Monthly':
    default:
      endDate = startDate.clone().endOf('month');
      break;
  }

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate()
  };
};

module.exports = {
  calculatePayroll,
  calculateOvertimePay,
  calculateAnnualBreakdown,
  calculateNetPay,
  calculateYTDTotals,
  validatePayrollData,
  generatePayPeriodDates
};