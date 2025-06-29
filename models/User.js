const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "HR", "Finance", "Employee"],
      default: "Employee",
    },
    permissions: [
      {
        type: String,
        enum: [
          "create_user",
          "read_user",
          "update_user",
          "delete_user",
          "create_employee",
          "read_employee",
          "update_employee",
          "delete_employee",
          "create_payroll",
          "read_payroll",
          "update_payroll",
          "delete_payroll",
          "approve_payroll",
          "read_leave",
          "approve_leave",
          "create_leave",
          "update_leave",
          "read_attendance",
          "update_attendance",
          "read_audit",
          "read_notifications",
          "create_department",
          "update_department",
          "delete_department",
          "read_department",
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Set default permissions based on role
userSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    switch (this.role) {
      case "SuperAdmin":
        this.permissions = [
          "create_user",
          "read_user",
          "update_user",
          "delete_user",
          "create_employee",
          "read_employee",
          "update_employee",
          "delete_employee",
          "create_payroll",
          "read_payroll",
          "update_payroll",
          "delete_payroll",
          "approve_payroll",
          "read_leave",
          "approve_leave",
          "create_leave",
          "update_leave",
          "read_attendance",
          "update_attendance",
          "read_audit",
          "read_notifications",
          "create_department",
          "update_department",
          "delete_department",
          "read_department",
        ];
        break;
      case "Admin":
        this.permissions = [
          "read_user",
          "update_user",
          "create_employee",
          "read_employee",
          "update_employee",
          "read_payroll",
          "update_payroll",
          "approve_payroll",
          "read_leave",
          "approve_leave",
          "update_leave",
          "read_attendance",
          "update_attendance",
          "read_notifications",
        ];
        break;
      case "HR":
        this.permissions = [
          "create_employee",
          "read_employee",
          "update_employee",
          "read_payroll",
          "read_leave",
          "approve_leave",
          "create_leave",
          "update_leave",
          "read_attendance",
          "update_attendance",
          "read_notifications",
        ];
        break;
      case "Finance":
        this.permissions = [
          "read_employee",
          "create_payroll",
          "read_payroll",
          "update_payroll",
          "approve_payroll",
          "read_notifications",
        ];
        break;
      case "Employee":
        this.permissions = [
          "read_employee",
          "read_payroll",
          "create_leave",
          "read_leave",
          "read_attendance",
          "read_notifications",
        ];
        break;
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
