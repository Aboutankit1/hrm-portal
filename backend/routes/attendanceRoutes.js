const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.post('/swipe-in', swipeIn);
router.post('/swipe-out', swipeOut);
router.get('/today', getTodayStatus);
router.get('/calendar', getMyCalendar);
router.get('/stats', authorize('admin', 'super_admin'), getAttendanceStats);

// Correction requests — "I forgot to swipe" flow
router.get('/corrections', getCorrections);
router.post('/corrections', requestCorrection);
router.patch('/corrections/:id/approve', authorize('admin', 'super_admin'), approveCorrection);
router.patch('/corrections/:id/reject', authorize('admin', 'super_admin'), rejectCorrection);
router.delete('/corrections/:id', cancelCorrection);

router.get('/', authorize('admin', 'super_admin'), getAllAttendance);

module.exports = router;
