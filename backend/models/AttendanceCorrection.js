const mongoose = require('mongoose');

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD — the day being corrected
    requestedStatus: {
      type: String,
      enum: ['present', 'half_day'],
      default: 'present',
    },
    requestedSwipeInTime: { type: String, default: '' }, // e.g. "09:05" (optional, informational)
    requestedSwipeOutTime: { type: String, default: '' },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    reviewNote: { type: String, default: '' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AttendanceCorrection', attendanceCorrectionSchema);
