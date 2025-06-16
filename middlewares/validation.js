const Joi = require("joi");

// User validation schemas
const userValidation = {
  register: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string()
      .valid("SuperAdmin", "Admin", "HR", "Finance", "Employee")
      .optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),

  resetPassword: Joi.object({
    newPassword: Joi.string().min(6).required(),
  }),
};

// Employee validation schemas
const employeeValidation = {
  create: Joi.object({
    userId: Joi.string().required(),
    // employeeId: Joi.string().optional(), // Add this line to allow employeeId
    personalInfo: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      dateOfBirth: Joi.date().optional(),
      gender: Joi.string().valid("Male", "Female", "Other").optional(),
      phone: Joi.string().optional(),
      address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zipCode: Joi.string().optional(),
        country: Joi.string().optional(),
      }).optional(),
    }).required(),
    employmentDetails: Joi.object({
      type: Joi.string()
        .valid("Permanent", "Contractual", "Freelancer")
        .required(),
      department: Joi.string().required(),
      position: Joi.string().required(),
      joiningDate: Joi.date().required(),
      reportingManager: Joi.string().optional(),
    }).required(),
    salaryDetails: Joi.object({
      baseSalary: Joi.number().positive().required(),
      currency: Joi.string().default("USD"),
      payFrequency: Joi.string()
        .valid("Monthly", "Bi-weekly", "Weekly")
        .default("Monthly"),
      bankDetails: Joi.object({
        accountNumber: Joi.string().optional(),
        bankName: Joi.string().optional(),
        routingNumber: Joi.string().optional(),
        accountType: Joi.string().valid("Checking", "Savings").optional(),
      }).optional(),
    }).required(),
  }),
};

// Payroll validation schemas
const payrollValidation = {
  create: Joi.object({
    employee: Joi.string().required(),
    payPeriod: Joi.object({
      month: Joi.number().min(1).max(12).required(),
      year: Joi.number().min(2020).max(2030).required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
    }).required(),
    earnings: Joi.object({
      baseSalary: Joi.number().positive().required(),
      overtime: Joi.number().min(0).default(0),
      bonus: Joi.number().min(0).default(0),
      commission: Joi.number().min(0).default(0),
      allowances: Joi.number().min(0).default(0),
    }).required(),
    deductions: Joi.object({
      tax: Joi.number().min(0).default(0),
      socialSecurity: Joi.number().min(0).default(0),
      healthInsurance: Joi.number().min(0).default(0),
      retirementContribution: Joi.number().min(0).default(0),
      otherDeductions: Joi.number().min(0).default(0),
    }).optional(),
  }),
};

// Leave validation schemas
const leaveValidation = {
  create: Joi.object({
    leaveType: Joi.string()
      .valid(
        "Annual",
        "Sick",
        "Maternity",
        "Paternity",
        "Personal",
        "Emergency"
      )
      .required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    reason: Joi.string().required(),
  }),
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  };
};

module.exports = {
  validate,
  userValidation,
  employeeValidation,
  payrollValidation,
  leaveValidation,
};
