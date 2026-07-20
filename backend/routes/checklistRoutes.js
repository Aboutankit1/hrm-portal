const express = require('express');
const router = express.Router();
const {
  getTemplate,
  updateTemplate,
  getChecklists,
  startOffboarding,
  toggleItem,
} = require('../controllers/checklistController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/template/:type', getTemplate);
router.put('/template/:type', authorize('admin', 'super_admin'), updateTemplate);

router.get('/', getChecklists);
router.post('/offboarding/:employeeId', authorize('admin', 'super_admin'), startOffboarding);
router.patch('/:id/items/:itemId', authorize('admin', 'super_admin'), toggleItem);

module.exports = router;
