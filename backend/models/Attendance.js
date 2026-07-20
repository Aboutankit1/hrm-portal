const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD, one record per employee per day
    swipeInTime: { type: Date },
    swipeOutTime: { type: Date },
    swipeInDevice: { type: String, default: '' },
    deviceType: { type: String, enum: ['phone', 'tablet', 'laptop', 'unknown'], default: 'unknown' },
    deviceModel: { type: String, default: '' },
    osName: { type: String, default: '' },
    swipeInBrowser: { type: String, default: '' },
    swipeInIP: { type: String, default: '' },
    swipeInLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    distanceFromOfficeMeters: { type: Number }, // how far the swipe-in was from the matched office
    totalWorkingHours: { type: Number, default: 0 }, // in hours
    breakTime: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['present', 'late', 'half_day', 'absent', 'leave', 'holiday'],
      default: 'present',
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
