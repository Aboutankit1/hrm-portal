const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTaskStatus,
  addComment,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/', getTasks);
router.post('/', authorize('admin', 'super_admin'), createTask);
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/comments', addComment);
router.delete('/:id', authorize('admin', 'super_admin'), deleteTask);

module.exports = router;
