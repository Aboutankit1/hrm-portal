const mongoose = require('mongoose');

const checklistTemplateSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['onboarding', 'offboarding'], required: true, unique: true },
    items: [{ type: String, required: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChecklistTemplate', checklistTemplateSchema);
