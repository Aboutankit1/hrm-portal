const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true },
    profilePhoto: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    mobile: { type: String, required: true },
    address: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    dob: { type: Date },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: String, default: 'Employee' },
    salary: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    shift: {
      type: String,
      enum: ['morning', 'general', 'evening', 'night', 'flexible'],
      default: 'general',
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    emergencyContact: { type: String, default: '' },
    role: { type: String, default: 'employee' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

employeeSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);
