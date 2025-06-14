const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  payPeriod: {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  earnings: {
    baseSalary: { type: Number, required: true },
    overtime: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    totalEarnings: { type: Number, required: true }
  },
  deductions: {
    tax: { type: Number, default: 0 },
    socialSecurity: { type: Number, default: 0 },
    healthInsurance: { type: Number, default: 0 },
    retirementContribution: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    totalDeductions: { type: Number, required: true }
  },
  netSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Paid', 'Rejected'],
    default: 'Draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  paidAt: Date,
  payslipGenerated: {
    type: Boolean,
    default: false
  },
  notes: String
}, {
  timestamps: true
});

// Calculate totals before saving
payrollSchema.pre('save', function(next) {
  this.earnings.totalEarnings = 
    this.earnings.baseSalary + 
    this.earnings.overtime + 
    this.earnings.bonus + 
    this.earnings.commission + 
    this.earnings.allowances;

  this.deductions.totalDeductions = 
    this.deductions.tax + 
    this.deductions.socialSecurity + 
    this.deductions.healthInsurance + 
    this.deductions.retirementContribution + 
    this.deductions.otherDeductions;

  this.netSalary = this.earnings.totalEarnings - this.deductions.totalDeductions;
  
  next();
});

// Compound index for unique payroll per employee per period
payrollSchema.index({ employee: 1, 'payPeriod.month': 1, 'payPeriod.year': 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);