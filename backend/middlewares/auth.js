const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

// Verifies access token and attaches req.user = { id, role, doc }
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'super_admin' || decoded.role === 'admin') {
      user = await Admin.findById(decoded.id);
    } else {
      user = await Employee.findById(decoded.id);
    }

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    req.user = { id: decoded.id, role: decoded.role, doc: user };
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

// Usage: authorize('admin', 'super_admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient permissions');
    }
    next();
  };
};

module.exports = { protect, authorize };
