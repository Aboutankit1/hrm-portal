const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/', getLeaves);
router.post('/', applyLeave);
router.patch('/:id/approve', authorize('admin', 'super_admin'), approveLeave);
router.patch('/:id/reject', authorize('admin', 'super_admin'), rejectLeave);
router.delete('/:id', cancelLeave);

module.exports = router;
