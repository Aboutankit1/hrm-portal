const asyncHandler = require('express-async-handler');
const Holiday = require('../models/Holiday');

// @desc Get holidays, optionally filtered by month/year
// @route GET /api/holidays?month=7&year=2026
const getHolidays = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const query = {};

  if (year) {
    const m = month ? String(month).padStart(2, '0') : null;
    query.date = { $regex: m ? `^${year}-${m}` : `^${year}` };
  }

  const holidays = await Holiday.find(query).sort({ date: 1 });
  res.json({ success: true, count: holidays.length, data: holidays });
});

// @desc Add a holiday (admin only)
// @route POST /api/holidays
const createHoliday = asyncHandler(async (req, res) => {
  const { date, name, description } = req.body;

  if (!date || !name) {
    res.status(400);
    throw new Error('date and name are required');
  }

  const exists = await Holiday.findOne({ date });
  if (exists) {
    res.status(400);
    throw new Error('A holiday is already set for this date');
  }

  const holiday = await Holiday.create({ date, name, description });
  res.status(201).json({ success: true, data: holiday });
});

// @desc Delete a holiday (admin only)
// @route DELETE /api/holidays/:id
const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findById(req.params.id);
  if (!holiday) {
    res.status(404);
    throw new Error('Holiday not found');
  }
  await holiday.deleteOne();
  res.json({ success: true, message: 'Holiday removed' });
});

module.exports = { getHolidays, createHoliday, deleteHoliday };
