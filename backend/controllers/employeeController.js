const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const { createChecklistForEmployee } = require('./checklistController');

// @desc Get all employees (with search, filter, pagination)
// @route GET /api/employees
const getEmployees = asyncHandler(async (req, res) => {
  const { search, department, status, shift, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) query.department = department;
  if (status) query.status = status;
  if (shift) query.shift = shift;

  const skip = (Number(page) - 1) * Number(limit);

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate('department', 'name')
      .populate('manager', 'name employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Employee.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: employees.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: employees,
  });
});

// @desc Get single employee
// @route GET /api/employees/:id
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('department', 'name')
    .populate('manager', 'name employeeId');

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  res.json({ success: true, data: employee });
});

// @desc Create employee
// @route POST /api/employees
const createEmployee = asyncHandler(async (req, res) => {
  const exists = await Employee.findOne({ email: req.body.email });
  if (exists) {
    res.status(400);
    throw new Error('Employee with this email already exists');
  }

  const employee = await Employee.create(req.body);
  const safe = employee.toObject();
  delete safe.password;

  // Auto-generate an onboarding checklist so HR/IT immediately see what's pending
  await createChecklistForEmployee(employee._id, 'onboarding');

  const io = req.app.get('io');
  if (io) io.emit('checklist:onboardingStarted', { employee: safe });

  res.status(201).json({ success: true, data: safe });
});

// @desc Update employee
// @route PUT /api/employees/:id
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  const updatable = [
    'name', 'mobile', 'address', 'gender', 'dob', 'department', 'designation',
    'salary', 'joiningDate', 'shift', 'manager', 'emergencyContact', 'profilePhoto',
  ];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) employee[field] = req.body[field];
  });

  await employee.save();
  res.json({ success: true, data: employee });
});

// @desc Delete employee
// @route DELETE /api/employees/:id
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  await employee.deleteOne();
  res.json({ success: true, message: 'Employee deleted successfully' });
});

// @desc Suspend employee
// @route PATCH /api/employees/:id/suspend
const suspendEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { status: 'suspended' },
    { new: true }
  );
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  res.json({ success: true, data: employee });
});

// @desc Activate employee
// @route PATCH /api/employees/:id/activate
const activateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { status: 'active' },
    { new: true }
  );
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  res.json({ success: true, data: employee });
});

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  suspendEmployee,
  activateEmployee,
};
