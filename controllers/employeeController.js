const Employee = require("../models/Employee");
const User = require("../models/User");
const { logAudit } = require("../services/auditService");

// Create employee
const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Check if employee already exists for this user
    const existingEmployee = await Employee.findOne({
      userId: employeeData.userId,
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee record already exists for this user",
      });
    }

    // Create new employee instance
    const employee = new Employee(employeeData);

    // Save the employee
    const savedEmployee = await employee.save();

    // Log audit
    await logAudit(
      req.user._id,
      "CREATE_EMPLOYEE",
      "Employee",
      savedEmployee._id,
      { employeeId: savedEmployee.employeeId, userId: employeeData.userId },
      req.ip,
      req.get("User-Agent")
    );

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: savedEmployee,
    });
  } catch (error) {
    console.error("Create employee error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during employee creation",
      details: error.errors
        ? Object.values(error.errors).map((err) => err.message)
        : undefined,
    });
  }
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, type, isActive } = req.query;

    const filter = {};
    if (department) filter["employmentDetails.department"] = department;
    if (type) filter["employmentDetails.type"] = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const employees = await Employee.find(filter)
      .populate("userId", "username email role")
      .populate(
        "employmentDetails.reportingManager",
        "personalInfo.firstName personalInfo.lastName employeeId"
      )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(filter);

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employees",
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("userId", "username email role")
      .populate(
        "employmentDetails.reportingManager",
        "personalInfo.firstName personalInfo.lastName employeeId"
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get employee by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employee",
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "username email role");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Log audit
    await logAudit(
      req.user._id,
      "UPDATE_EMPLOYEE",
      "Employee",
      employee._id,
      { employeeId: employee.employeeId, updates: Object.keys(updateData) },
      req.ip,
      req.get("User-Agent")
    );

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during employee update",
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await Employee.findByIdAndDelete(id);

    // Log audit
    await logAudit(
      req.user._id,
      "DELETE_EMPLOYEE",
      "Employee",
      id,
      { employeeId: employee.employeeId },
      req.ip,
      req.get("User-Agent")
    );

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during employee deletion",
    });
  }
};

// Get employee profile (for logged-in employee)
const getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id })
      .populate("userId", "username email role")
      .populate(
        "employmentDetails.reportingManager",
        "personalInfo.firstName personalInfo.lastName employeeId"
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
};
