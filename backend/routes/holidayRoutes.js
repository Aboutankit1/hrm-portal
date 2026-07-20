const express = require('express');
const router = express.Router();
const { getHolidays, createHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/', getHolidays);
router.post('/', authorize('admin', 'super_admin'), createHoliday);
router.delete('/:id', authorize('admin', 'super_admin'), deleteHoliday);

module.exports = router;
