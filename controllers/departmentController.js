const Department = require("../models/Department");
const Employee = require("../models/Employee");

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const { name, head } = req.body;
    const department = new Department({ name, head });
    await department.save();
    res
      .status(201)
      .json({ success: true, message: "Department created", data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, head } = req.body;
    const department = await Department.findByIdAndUpdate(
      id,
      { name, head },
      { new: true, runValidators: true }
    );
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    res.json({
      success: true,
      message: "Department updated",
      data: department,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }
    res.json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    console.log(departments);
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
