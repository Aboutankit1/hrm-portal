const express = require('express');
const router = express.Router();
const {
  getOfficeLocations,
  createOfficeLocation,
  updateOfficeLocation,
  deleteOfficeLocation,
} = require('../controllers/officeLocationController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/', getOfficeLocations);
router.post('/', authorize('admin', 'super_admin'), createOfficeLocation);
router.put('/:id', authorize('admin', 'super_admin'), updateOfficeLocation);
router.delete('/:id', authorize('admin', 'super_admin'), deleteOfficeLocation);

module.exports = router;
