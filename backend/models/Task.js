const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'review', 'completed', 'cancelled'],
      default: 'pending',
    },
    deadline: { type: Date },
    checklist: [
      {
        item: String,
        done: { type: Boolean, default: false },
      },
    ],
    attachments: [{ url: String, name: String }],
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, refPath: 'comments.authorModel' },
        authorModel: { type: String, enum: ['Admin', 'Employee'] },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
