const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: Date,
  totalHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half-day', 'On-leave'],
    default: 'Present'
  },
  notes: String
}, {
  timestamps: true
});

// Calculate total hours
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const timeDiff = this.checkOut.getTime() - this.checkIn.getTime();
    this.totalHours = timeDiff / (1000 * 60 * 60); // Convert to hours
    
    // Calculate overtime (assuming 8 hours is standard)
    if (this.totalHours > 8) {
      this.overtimeHours = this.totalHours - 8;
    }
  }
  next();
});

// Compound index for unique attendance per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);