const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const AttendanceCorrection = require('../models/AttendanceCorrection');
const OfficeLocation = require('../models/OfficeLocation');
const { parseDevice } = require('../utils/deviceParser');
const { distanceInMeters } = require('../utils/geo');

const todayStr = () => new Date().toISOString().split('T')[0];

const LATE_CUTOFF_HOUR = 9; // after 9:00 AM = late (simple default rule)

// Checks the given lat/lng against every active office location.
// Returns { allowed: true, nearestDistance, office } if inside any office radius,
// or { allowed: false, nearestDistance, nearestOffice } if not (or no location given).
// If no active offices are configured at all, geofencing is treated as OFF and always allowed.
const checkGeofence = async (location) => {
  const offices = await OfficeLocation.find({ isActive: true });
  if (offices.length === 0) {
    return { enforced: false, allowed: true, nearestDistance: null, office: null };
  }

  if (!location || location.lat === undefined || location.lng === undefined) {
    return { enforced: true, allowed: false, nearestDistance: null, office: null, reason: 'no_location' };
  }

  let nearest = null;
  let nearestDistance = Infinity;

  for (const office of offices) {
    const d = distanceInMeters(location.lat, location.lng, office.latitude, office.longitude);
    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = office;
    }
    if (d <= office.radiusMeters) {
      return { enforced: true, allowed: true, nearestDistance: Math.round(d), office };
    }
  }

  return { enforced: true, allowed: false, nearestDistance: Math.round(nearestDistance), office: nearest };
};

// @desc Swipe In
// @route POST /api/attendance/swipe-in
const swipeIn = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;
  const date = todayStr();

  let record = await Attendance.findOne({ employee: employeeId, date });
  if (record && record.swipeInTime) {
    res.status(400);
    throw new Error('You have already swiped in today');
  }

  const geo = await checkGeofence(req.body.location);
  if (geo.enforced && !geo.allowed) {
    res.status(403);
    if (geo.reason === 'no_location') {
      throw new Error('Location access is required to swipe in. Please allow location permissions and try again.');
    }
    throw new Error(
      `You're too far from ${geo.office?.name || 'the office'} to swipe in (${geo.nearestDistance}m away, must be within ${geo.office?.radiusMeters}m).`
    );
  }

  const now = new Date();
  const status = now.getHours() >= LATE_CUTOFF_HOUR ? 'late' : 'present';
  const rawUA = req.headers['user-agent'] || req.body.device || '';
  const { deviceType, deviceModel, osName, browserName } = parseDevice(rawUA);

  const data = {
    employee: employeeId,
    date,
    swipeInTime: now,
    swipeInDevice: rawUA,
    deviceType,
    deviceModel,
    osName,
    swipeInBrowser: browserName || req.body.browser || '',
    swipeInIP: req.ip,
    swipeInLocation: req.body.location || undefined,
    distanceFromOfficeMeters: geo.enforced ? geo.nearestDistance : undefined,
    status,
  };

  if (record) {
    Object.assign(record, data);
    await record.save();
  } else {
    record = await Attendance.create(data);
  }

  const io = req.app.get('io');
  if (io) {
    const employee = await Employee.findById(employeeId).select('name employeeId');
    io.emit('attendance:swipeIn', { employee, record, time: now });
  }

  res.json({ success: true, data: record });
});

// @desc Swipe Out
// @route POST /api/attendance/swipe-out
const swipeOut = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;
  const date = todayStr();

  const record = await Attendance.findOne({ employee: employeeId, date });
  if (!record || !record.swipeInTime) {
    res.status(400);
    throw new Error('You have not swiped in today');
  }
  if (record.swipeOutTime) {
    res.status(400);
    throw new Error('You have already swiped out today');
  }

  const now = new Date();
  const workingMs = now - new Date(record.swipeInTime);
  const workingHours = Math.max(0, workingMs / (1000 * 60 * 60));
  const breakTime = req.body.breakTime || 0;
  const standardHours = 8;
  const overtime = Math.max(0, workingHours - standardHours);

  record.swipeOutTime = now;
  record.totalWorkingHours = Number((workingHours - breakTime).toFixed(2));
  record.breakTime = breakTime;
  record.overtime = Number(overtime.toFixed(2));
  if (record.totalWorkingHours < 4) record.status = 'half_day';

  await record.save();

  const io = req.app.get('io');
  if (io) {
    const employee = await Employee.findById(employeeId).select('name employeeId');
    io.emit('attendance:swipeOut', { employee, record, time: now });
  }

  res.json({ success: true, data: record });
});

// @desc Get my today's attendance status
// @route GET /api/attendance/today
const getTodayStatus = asyncHandler(async (req, res) => {
  const record = await Attendance.findOne({ employee: req.user.id, date: todayStr() });
  res.json({ success: true, data: record || null });
});

// Builds a day-by-day status list for one employee across a whole month by
// layering: real Attendance record > approved Leave > company Holiday > Absent (past days only).
const buildEmployeeMonthCalendar = async (employeeId, month, year) => {
  const m = String(month).padStart(2, '0');
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthPrefix = `${year}-${m}`;
  const today = todayStr();

  const [attendanceRecords, approvedLeaves, holidays] = await Promise.all([
    Attendance.find({ employee: employeeId, date: { $regex: `^${monthPrefix}` } }),
    Leave.find({ employee: employeeId, status: 'approved' }),
    Holiday.find({ date: { $regex: `^${monthPrefix}` } }),
  ]);

  const attendanceByDate = {};
  attendanceRecords.forEach((r) => {
    attendanceByDate[r.date] = r;
  });

  const holidayByDate = {};
  holidays.forEach((h) => {
    holidayByDate[h.date] = h;
  });

  const isOnApprovedLeave = (dateStr) => {
    const d = new Date(dateStr);
    return approvedLeaves.some((lv) => d >= new Date(lv.startDate) && d <= new Date(lv.endDate));
  };

  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    const attendance = attendanceByDate[dateStr];

    if (attendance) {
      days.push({
        date: dateStr,
        status: attendance.status,
        source: 'attendance',
        swipeInTime: attendance.swipeInTime,
        swipeOutTime: attendance.swipeOutTime,
        totalWorkingHours: attendance.totalWorkingHours,
        deviceType: attendance.deviceType,
        deviceModel: attendance.deviceModel,
        osName: attendance.osName,
      });
      continue;
    }

    if (holidayByDate[dateStr]) {
      days.push({ date: dateStr, status: 'holiday', source: 'holiday', holidayName: holidayByDate[dateStr].name });
      continue;
    }

    if (isOnApprovedLeave(dateStr)) {
      days.push({ date: dateStr, status: 'leave', source: 'leave' });
      continue;
    }

    if (dateStr < today) {
      days.push({ date: dateStr, status: 'absent', source: 'computed' });
      continue;
    }

    // Today or future date with no record yet — leave blank, nothing to show.
    days.push({ date: dateStr, status: null, source: 'none' });
  }

  return days;
};

// @desc Get my attendance calendar for a given month (full month, absent/leave/holiday aware)
// @route GET /api/attendance/calendar?month=7&year=2026
const getMyCalendar = asyncHandler(async (req, res) => {
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();

  const days = await buildEmployeeMonthCalendar(req.user.id, month, year);
  res.json({ success: true, data: days });
});

// @desc Admin: get attendance for all active employees on a given date (default today)
//       Includes employees who did NOT swipe in — status resolved via Leave/Holiday/Absent.
// @route GET /api/attendance?date=YYYY-MM-DD
const getAllAttendance = asyncHandler(async (req, res) => {
  const date = req.query.date || todayStr();
  const today = todayStr();

  const [employees, attendanceRecords, approvedLeaves, holiday] = await Promise.all([
    Employee.find({ status: 'active' }).select('name employeeId department profilePhoto').populate('department', 'name'),
    Attendance.find({ date }).populate('employee', 'name employeeId department profilePhoto'),
    Leave.find({ status: 'approved', startDate: { $lte: new Date(date) }, endDate: { $gte: new Date(date) } }),
    Holiday.findOne({ date }),
  ]);

  const attendanceByEmployee = {};
  attendanceRecords.forEach((r) => {
    attendanceByEmployee[r.employee?._id?.toString()] = r;
  });

  const leaveEmployeeIds = new Set(approvedLeaves.map((lv) => lv.employee.toString()));

  const data = employees.map((emp) => {
    const record = attendanceByEmployee[emp._id.toString()];
    if (record) {
      return {
        _id: record._id,
        employee: emp,
        swipeInTime: record.swipeInTime,
        swipeOutTime: record.swipeOutTime,
        totalWorkingHours: record.totalWorkingHours,
        deviceType: record.deviceType,
        deviceModel: record.deviceModel,
        osName: record.osName,
        status: record.status,
      };
    }

    if (holiday) {
      return { _id: `holiday-${emp._id}`, employee: emp, status: 'holiday', holidayName: holiday.name };
    }

    if (leaveEmployeeIds.has(emp._id.toString())) {
      return { _id: `leave-${emp._id}`, employee: emp, status: 'leave' };
    }

    return {
      _id: `absent-${emp._id}`,
      employee: emp,
      status: date <= today ? 'absent' : null,
    };
  });

  res.json({ success: true, date, count: data.length, data });
});

// @desc Admin dashboard attendance stats for today
// @route GET /api/attendance/stats
const getAttendanceStats = asyncHandler(async (req, res) => {
  const date = todayStr();
  const totalEmployees = await Employee.countDocuments({ status: 'active' });

  const records = await Attendance.find({ date });
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const halfDay = records.filter((r) => r.status === 'half_day').length;
  const working = records.filter((r) => r.swipeInTime && !r.swipeOutTime).length;
  const checkedIn = records.length;
  const absent = Math.max(0, totalEmployees - checkedIn);

  res.json({
    success: true,
    data: {
      totalEmployees,
      present,
      late,
      halfDay,
      working,
      absent,
      checkedIn,
    },
  });
});

// @desc Employee: request a correction for a day they forgot to swipe (or swiped incorrectly)
// @route POST /api/attendance/corrections
const requestCorrection = asyncHandler(async (req, res) => {
  const { date, requestedStatus, requestedSwipeInTime, requestedSwipeOutTime, reason } = req.body;

  if (!date || !reason) {
    res.status(400);
    throw new Error('date and reason are required');
  }

  if (date > todayStr()) {
    res.status(400);
    throw new Error('You cannot request a correction for a future date');
  }

  const existingPending = await AttendanceCorrection.findOne({
    employee: req.user.id,
    date,
    status: 'pending',
  });
  if (existingPending) {
    res.status(400);
    throw new Error('You already have a pending correction request for this date');
  }

  const correction = await AttendanceCorrection.create({
    employee: req.user.id,
    date,
    requestedStatus: requestedStatus || 'present',
    requestedSwipeInTime: requestedSwipeInTime || '',
    requestedSwipeOutTime: requestedSwipeOutTime || '',
    reason,
  });

  const io = req.app.get('io');
  if (io) io.emit('attendance:correctionRequested', correction);

  res.status(201).json({ success: true, data: correction });
});

// @desc Get correction requests — admin sees all (optionally filtered), employee sees own
// @route GET /api/attendance/corrections
const getCorrections = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'employee') {
    query.employee = req.user.id;
  }
  if (req.query.status) query.status = req.query.status;

  const corrections = await AttendanceCorrection.find(query)
    .populate('employee', 'name employeeId department')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: corrections.length, data: corrections });
});

// @desc Admin: approve a correction — creates/updates the Attendance record for that day
// @route PATCH /api/attendance/corrections/:id/approve
const approveCorrection = asyncHandler(async (req, res) => {
  const correction = await AttendanceCorrection.findById(req.params.id);
  if (!correction) {
    res.status(404);
    throw new Error('Correction request not found');
  }
  if (correction.status !== 'pending') {
    res.status(400);
    throw new Error('This request has already been reviewed');
  }

  // Build swipe timestamps on the requested date if the employee supplied times (e.g. "09:05")
  const buildTimestamp = (timeStr) => {
    if (!timeStr) return undefined;
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(`${correction.date}T00:00:00`);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  const swipeInTime = buildTimestamp(correction.requestedSwipeInTime);
  const swipeOutTime = buildTimestamp(correction.requestedSwipeOutTime);

  let totalWorkingHours;
  if (swipeInTime && swipeOutTime) {
    totalWorkingHours = Number(((swipeOutTime - swipeInTime) / (1000 * 60 * 60)).toFixed(2));
  }

  let attendance = await Attendance.findOne({ employee: correction.employee, date: correction.date });
  if (!attendance) {
    attendance = new Attendance({ employee: correction.employee, date: correction.date });
  }
  attendance.status = correction.requestedStatus;
  if (swipeInTime) attendance.swipeInTime = swipeInTime;
  if (swipeOutTime) attendance.swipeOutTime = swipeOutTime;
  if (totalWorkingHours !== undefined) attendance.totalWorkingHours = totalWorkingHours;
  await attendance.save();

  correction.status = 'approved';
  correction.reviewedBy = req.user.id;
  correction.reviewNote = req.body.note || '';
  correction.reviewedAt = new Date();
  await correction.save();

  const io = req.app.get('io');
  if (io) io.emit('attendance:correctionApproved', correction);

  res.json({ success: true, data: correction });
});

// @desc Admin: reject a correction request
// @route PATCH /api/attendance/corrections/:id/reject
const rejectCorrection = asyncHandler(async (req, res) => {
  const correction = await AttendanceCorrection.findById(req.params.id);
  if (!correction) {
    res.status(404);
    throw new Error('Correction request not found');
  }
  if (correction.status !== 'pending') {
    res.status(400);
    throw new Error('This request has already been reviewed');
  }

  correction.status = 'rejected';
  correction.reviewedBy = req.user.id;
  correction.reviewNote = req.body.note || '';
  correction.reviewedAt = new Date();
  await correction.save();

  const io = req.app.get('io');
  if (io) io.emit('attendance:correctionRejected', correction);

  res.json({ success: true, data: correction });
});

// @desc Employee: cancel their own pending correction request
// @route DELETE /api/attendance/corrections/:id
const cancelCorrection = asyncHandler(async (req, res) => {
  const correction = await AttendanceCorrection.findById(req.params.id);
  if (!correction) {
    res.status(404);
    throw new Error('Correction request not found');
  }
  if (correction.employee.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to cancel this request');
  }
  if (correction.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending requests can be cancelled');
  }

  await correction.deleteOne();
  res.json({ success: true, message: 'Correction request cancelled' });
});

module.exports = {
  swipeIn,
  swipeOut,
  getTodayStatus,
  getMyCalendar,
  getAllAttendance,
  getAttendanceStats,
  requestCorrection,
  getCorrections,
  approveCorrection,
  rejectCorrection,
  cancelCorrection,
};
