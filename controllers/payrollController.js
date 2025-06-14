const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { calculatePayroll } = require('../services/payrollService');
const { generatePayslipPDF } = require('../utils/pdfGenerator');
const { generatePayrollCSV } = require('../utils/csvGenerator');
const { logAudit } = require('../services/auditService');

// Create payroll entry
const createPayroll = async (req, res) => {
  try {
    const payrollData = req.body;

    // Verify employee exists
    const employee = await Employee.findById(payrollData.employee);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if payroll already exists for this period
    const existingPayroll = await Payroll.findOne({
      employee: payrollData.employee,
      'payPeriod.month': payrollData.payPeriod.month,
      'payPeriod.year': payrollData.payPeriod.year
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already exists for this employee and period'
      });
    }

    // Calculate payroll using service
    const calculatedPayroll = await calculatePayroll(employee, payrollData);
    
    const payroll = new Payroll(calculatedPayroll);
    await payroll.save();

    // Log audit
    await logAudit(
      req.user._id,
      'CREATE_PAYROLL',
      'Payroll',
      payroll._id,
      { 
        employee: employee.employeeId,
        period: `${payrollData.payPeriod.month}/${payrollData.payPeriod.year}`,
        netSalary: payroll.netSalary
      },
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json({
      success: true,
      message: 'Payroll created successfully',
      data: payroll
    });
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payroll creation'
    });
  }
};

// Get all payroll entries
const getPayrolls = async (req, res) => {
  try {
    const { page = 1, limit = 10, month, year, status, employee } = req.query;
    
    const filter = {};
    if (month) filter['payPeriod.month'] = month;
    if (year) filter['payPeriod.year'] = year;
    if (status) filter.status = status;
    if (employee) filter.employee = employee;

    const payrolls = await Payroll.find(filter)
      .populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName employmentDetails.department')
      .populate('approvedBy', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Payroll.countDocuments(filter);

    res.json({
      success: true,
      data: {
        payrolls,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payrolls'
    });
  }
};

// Get payroll by ID
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'employeeId personalInfo userId')
      .populate('approvedBy', 'username email');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    res.json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Get payroll by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payroll'
    });
  }
};

// Update payroll
const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    // Don't allow updates to approved/paid payrolls
    if (payroll.status === 'Approved' || payroll.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update approved or paid payroll'
      });
    }

    Object.assign(payroll, updateData);
    await payroll.save();

    // Log audit
    await logAudit(
      req.user._id,
      'UPDATE_PAYROLL',
      'Payroll',
      payroll._id,
      { updates: Object.keys(updateData) },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Payroll updated successfully',
      data: payroll
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payroll update'
    });
  }
};

// Approve payroll
const approvePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    if (payroll.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payrolls can be approved'
      });
    }

    payroll.status = 'Approved';
    payroll.approvedBy = req.user._id;
    payroll.approvedAt = new Date();
    if (notes) payroll.notes = notes;

    await payroll.save();

    // Log audit
    await logAudit(
      req.user._id,
      'APPROVE_PAYROLL',
      'Payroll',
      payroll._id,
      { netSalary: payroll.netSalary },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Payroll approved successfully',
      data: payroll
    });
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payroll approval'
    });
  }
};

// Generate payslip PDF
const generatePayslip = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id)
      .populate('employee', 'employeeId personalInfo employmentDetails salaryDetails');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    const pdfBuffer = await generatePayslipPDF(payroll);

    // Update payroll to mark payslip as generated
    payroll.payslipGenerated = true;
    await payroll.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payroll.employee.employeeId}-${payroll.payPeriod.month}-${payroll.payPeriod.year}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payslip generation'
    });
  }
};

// Generate payroll CSV for bank transfer
const handleGeneratePayrollCSV = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    const payrolls = await Payroll.find({
      'payPeriod.month': month,
      'payPeriod.year': year,
      status: 'Approved'
    }).populate('employee', 'employeeId personalInfo salaryDetails');

    if (payrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No approved payrolls found for the specified period'
      });
    }

    const csvBuffer = await generatePayrollCSV(payrolls);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payroll-${month}-${year}.csv`);
    res.send(csvBuffer);
  } catch (error) {
    console.error('Generate payroll CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during CSV generation'
    });
  }
};

// Get my payrolls (for employees)
const getMyPayrolls = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const { page = 1, limit = 10 } = req.query;

    const payrolls = await Payroll.find({ employee: employee._id })
      .populate('approvedBy', 'username email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });

    const total = await Payroll.countDocuments({ employee: employee._id });

    res.json({
      success: true,
      data: {
        payrolls,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get my payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payrolls'
    });
  }
};

module.exports = {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  approvePayroll,
  generatePayslip,
  handleGeneratePayrollCSV,
  getMyPayrolls
};