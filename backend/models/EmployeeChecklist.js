const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
});

const employeeChecklistSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['onboarding', 'offboarding'], required: true },
    items: [checklistItemSchema],
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// An employee can have one active onboarding checklist and one active offboarding checklist
employeeChecklistSchema.index({ employee: 1, type: 1 });

module.exports = mongoose.model('EmployeeChecklist', employeeChecklistSchema);
