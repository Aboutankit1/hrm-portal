const asyncHandler = require('express-async-handler');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc Get all departments (with employee count)
// @route GET /api/departments
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate('head', 'name employeeId').sort({ name: 1 });

  const withCounts = await Promise.all(
    departments.map(async (dept) => {
      const employeeCount = await Employee.countDocuments({ department: dept._id });
      return { ...dept.toObject(), employeeCount };
    })
  );

  res.json({ success: true, count: withCounts.length, data: withCounts });
});

// @desc Create department
// @route POST /api/departments
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, head } = req.body;

  const exists = await Department.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error('Department with this name already exists');
  }

  const department = await Department.create({ name, description, head });
  res.status(201).json({ success: true, data: department });
});

// @desc Update department
// @route PUT /api/departments/:id
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  const { name, description, head } = req.body;
  if (name) department.name = name;
  if (description !== undefined) department.description = description;
  if (head !== undefined) department.head = head;

  await department.save();
  res.json({ success: true, data: department });
});

// @desc Delete department
// @route DELETE /api/departments/:id
const deleteDepartment = asyncHandler(async (req, res) => {
  const inUse = await Employee.countDocuments({ department: req.params.id });
  if (inUse > 0) {
    res.status(400);
    throw new Error('Cannot delete department with assigned employees');
  }

  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  await department.deleteOne();
  res.json({ success: true, message: 'Department deleted successfully' });
});

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
