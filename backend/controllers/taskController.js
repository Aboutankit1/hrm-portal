const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

// @desc Get tasks (admin sees all, employee sees own)
// @route GET /api/tasks
const getTasks = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'employee') {
    query.assignedTo = req.user.id;
  }
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name employeeId profilePhoto')
    .populate('assignedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: tasks.length, data: tasks });
});

// @desc Create + assign task (admin only)
// @route POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, priority, deadline, checklist } = req.body;

  const task = await Task.create({
    title,
    description,
    assignedTo,
    assignedBy: req.user.id,
    priority,
    deadline,
    checklist,
  });

  const io = req.app.get('io');
  if (io && assignedTo?.length) {
    assignedTo.forEach((empId) => io.to(`employee:${empId}`).emit('task:assigned', task));
  }

  res.status(201).json({ success: true, data: task });
});

// @desc Update task status (employee: accept/reject/progress/complete)
// @route PATCH /api/tasks/:id/status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const allowed = ['pending', 'accepted', 'in_progress', 'review', 'completed', 'cancelled'];
  if (!allowed.includes(req.body.status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  task.status = req.body.status;
  await task.save();

  const io = req.app.get('io');
  if (io && task.status === 'completed') {
    io.emit('task:completed', task);
  }

  res.json({ success: true, data: task });
});

// @desc Add comment to a task
// @route POST /api/tasks/:id/comments
const addComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task.comments.push({
    author: req.user.id,
    authorModel: req.user.role === 'employee' ? 'Employee' : 'Admin',
    text: req.body.text,
  });

  await task.save();
  res.json({ success: true, data: task });
});

// @desc Delete task (admin only)
// @route DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted successfully' });
});

module.exports = { getTasks, createTask, updateTaskStatus, addComment, deleteTask };
