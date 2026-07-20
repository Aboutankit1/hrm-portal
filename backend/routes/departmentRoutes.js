const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/', getDepartments);
router.post('/', authorize('admin', 'super_admin'), createDepartment);
router.put('/:id', authorize('admin', 'super_admin'), updateDepartment);
router.delete('/:id', authorize('admin', 'super_admin'), deleteDepartment);

module.exports = router;
