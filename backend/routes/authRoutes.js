const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  adminLogin,
  employeeLogin,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/authController');
const { registerAdminValidator, loginValidator } = require('../validators/authValidator');
const { protect } = require('../middlewares/auth');

router.post('/register-admin', registerAdminValidator, registerAdmin);
router.post('/admin-login', loginValidator, adminLogin);
router.post('/employee-login', loginValidator, employeeLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
