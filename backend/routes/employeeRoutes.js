const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  suspendEmployee,
  activateEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middlewares/auth');
const { createEmployeeValidator, validateResult } = require('../validators/employeeValidator');

router.use(protect);

router.get('/', authorize('admin', 'super_admin'), getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('admin', 'super_admin'), createEmployeeValidator, validateResult, createEmployee);
router.put('/:id', authorize('admin', 'super_admin'), updateEmployee);
router.delete('/:id', authorize('admin', 'super_admin'), deleteEmployee);
router.patch('/:id/suspend', authorize('admin', 'super_admin'), suspendEmployee);
router.patch('/:id/activate', authorize('admin', 'super_admin'), activateEmployee);

module.exports = router;
