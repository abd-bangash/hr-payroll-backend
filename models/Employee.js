const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: false,
    // },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      phone: { type: String },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
    },
    employmentDetails: {
      type: {
        type: String,
        enum: [
          "Permanent",
          "Full time Contractual",
          "Part time Contractual",
          "Daily Wages",
          "Visiting Faculty",
        ],
        required: true,
      },
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
      position: { type: String, required: true },
      joiningDate: { type: Date, required: true },
      reportingManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    },
    salaryDetails: {
      baseSalary: { type: Number, required: true },
      currency: { type: String, default: "PKR" },
      payFrequency: {
        type: String,
        enum: ["Monthly", "Bi-weekly", "Weekly"],
        default: "Monthly",
      },
      overtime: {
        rate: {
          type: Number,
          default: 0,
        },
        hours: { type: Number },
      },
      bankDetails: {
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        accountType: { type: String, enum: ["Checking", "Savings"] },
      },
    },
    taxInfo: {
      taxId: String,
      taxExemptions: { type: Number, default: 0 },
      taxRate: { type: Number, default: 0.2 },
    },
    benefits: {
      healthInsurance: { type: Boolean, default: false },
      dentalInsurance: { type: Boolean, default: false },
      retirementPlan: { type: Boolean, default: false },
      paidTimeOff: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    terminationDate: Date,
    terminationReason: String,
  },
  {
    timestamps: true,
  }
);

// Generate employee ID
employeeSchema.pre("save", async function (next) {
  try {
    if (!this.employeeId) {
      const count = await this.constructor.countDocuments();
      this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
      console.log(this.employeeId);
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Employee", employeeSchema);
