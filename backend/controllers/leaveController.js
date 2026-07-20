const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');

const daysBetween = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
};

// @desc Apply for leave (employee)
// @route POST /api/leaves
const applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    res.status(400);
    throw new Error('leaveType, startDate, endDate and reason are all required');
  }

  if (new Date(endDate) < new Date(startDate)) {
    res.status(400);
    throw new Error('End date cannot be before start date');
  }

  const totalDays = leaveType === 'half_day' ? 0.5 : daysBetween(startDate, endDate);

  const leave = await Leave.create({
    employee: req.user.id,
    leaveType,
    startDate,
    endDate,
    totalDays,
    reason,
  });

  const io = req.app.get('io');
  if (io) io.emit('leave:applied', leave);

  res.status(201).json({ success: true, data: leave });
});

// @desc Get leaves — admin sees all (optionally filtered), employee sees own
// @route GET /api/leaves
const getLeaves = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'employee') {
    query.employee = req.user.id;
  } else if (req.query.employee) {
    query.employee = req.query.employee;
  }
  if (req.query.status) query.status = req.query.status;

  const leaves = await Leave.find(query)
    .populate('employee', 'name employeeId department')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: leaves.length, data: leaves });
});

// @desc Approve leave (admin)
// @route PATCH /api/leaves/:id/approve
const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  if (leave.status !== 'pending') {
    res.status(400);
    throw new Error('This leave request has already been reviewed');
  }

  leave.status = 'approved';
  leave.reviewedBy = req.user.id;
  leave.reviewNote = req.body.note || '';
  leave.reviewedAt = new Date();
  await leave.save();

  const io = req.app.get('io');
  if (io) io.emit('leave:approved', leave);

  res.json({ success: true, data: leave });
});

// @desc Reject leave (admin)
// @route PATCH /api/leaves/:id/reject
const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  if (leave.status !== 'pending') {
    res.status(400);
    throw new Error('This leave request has already been reviewed');
  }

  leave.status = 'rejected';
  leave.reviewedBy = req.user.id;
  leave.reviewNote = req.body.note || '';
  leave.reviewedAt = new Date();
  await leave.save();

  const io = req.app.get('io');
  if (io) io.emit('leave:rejected', leave);

  res.json({ success: true, data: leave });
});

// @desc Cancel a pending leave (employee, own request only)
// @route DELETE /api/leaves/:id
const cancelLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }

  const isOwner = leave.employee.toString() === req.user.id;
  const isAdmin = req.user.role !== 'employee';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to cancel this leave request');
  }
  if (leave.status !== 'pending' && !isAdmin) {
    res.status(400);
    throw new Error('Only pending leave requests can be cancelled');
  }

  await leave.deleteOne();
  res.json({ success: true, message: 'Leave request cancelled' });
});

module.exports = { applyLeave, getLeaves, approveLeave, rejectLeave, cancelLeave };
