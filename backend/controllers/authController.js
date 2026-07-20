const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const sendAuthResponse = async (res, user, role) => {
  const accessToken = generateAccessToken(user._id, role);
  const refreshToken = generateRefreshToken(user._id, role);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  res.json({
    success: true,
    accessToken,
    user: { ...safeUser, role },
  });
};

// @desc Register the first Admin / Super Admin (company setup)
// @route POST /api/auth/register-admin
const registerAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, companyName, role } = req.body;

  const exists = await Admin.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Admin with this email already exists');
  }

  const isFirstAdmin = (await Admin.countDocuments()) === 0;

  const admin = await Admin.create({
    name,
    email,
    password,
    companyName,
    role: isFirstAdmin ? 'super_admin' : role === 'super_admin' ? 'admin' : 'admin',
  });

  await sendAuthResponse(res, admin, admin.role);
});

// @desc Login for Admin / Super Admin
// @route POST /api/auth/admin-login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!admin.isActive) {
    res.status(403);
    throw new Error('This account has been disabled');
  }

  await sendAuthResponse(res, admin, admin.role);
});

// @desc Login for Employee
// @route POST /api/auth/employee-login
const employeeLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const employee = await Employee.findOne({ email }).select('+password');
  if (!employee || !(await employee.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (employee.status === 'suspended') {
    res.status(403);
    throw new Error('Your account has been suspended. Contact HR.');
  }

  await sendAuthResponse(res, employee, 'employee');
});

// @desc Refresh access token using refresh token cookie
// @route POST /api/auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const Model = decoded.role === 'admin' || decoded.role === 'super_admin' ? Admin : Employee;
  const user = await Model.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    res.status(401);
    throw new Error('Refresh token mismatch, please login again');
  }

  const newAccessToken = generateAccessToken(user._id, decoded.role);
  res.json({ success: true, accessToken: newAccessToken });
});

// @desc Logout - clear refresh token
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const Model = decoded.role === 'admin' || decoded.role === 'super_admin' ? Admin : Employee;
      await Model.findByIdAndUpdate(decoded.id, { refreshToken: '' });
    } catch (err) {
      // ignore invalid token on logout
    }
  }
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc Get currently logged in user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: { ...req.user.doc.toObject(), role: req.user.role } });
});

module.exports = { registerAdmin, adminLogin, employeeLogin, refreshToken, logout, getMe };
