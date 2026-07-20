const asyncHandler = require('express-async-handler');
const ChecklistTemplate = require('../models/ChecklistTemplate');
const EmployeeChecklist = require('../models/EmployeeChecklist');
const Employee = require('../models/Employee');

// Sensible out-of-the-box defaults so the feature is useful before an admin customizes it.
const DEFAULT_ITEMS = {
  onboarding: [
    'Offer letter signed',
    'Laptop / equipment issued',
    'Company email account created',
    'ID card issued',
    'Bank details collected',
    'Added to Slack / communication tools',
    'Orientation & training completed',
  ],
  offboarding: [
    'Resignation / exit approved',
    'Laptop & equipment returned',
    'System access revoked (email, tools)',
    'ID card returned',
    'Exit interview completed',
    'Final settlement processed',
    'Knowledge transfer completed',
  ],
};

// Creates (or resets) an employee's checklist for the given type, snapshotting
// whatever the current template items are at that moment.
const createChecklistForEmployee = async (employeeId, type) => {
  const template = await ChecklistTemplate.findOne({ type });
  const itemTexts = template?.items?.length ? template.items : DEFAULT_ITEMS[type];

  return EmployeeChecklist.create({
    employee: employeeId,
    type,
    items: itemTexts.map((text) => ({ text })),
  });
};

// @desc Get the default checklist template for a type (falls back to built-in defaults)
// @route GET /api/checklists/template/:type
const getTemplate = asyncHandler(async (req, res) => {
  const { type } = req.params;
  if (!['onboarding', 'offboarding'].includes(type)) {
    res.status(400);
    throw new Error('type must be onboarding or offboarding');
  }

  const template = await ChecklistTemplate.findOne({ type });
  res.json({ success: true, data: { type, items: template?.items?.length ? template.items : DEFAULT_ITEMS[type] } });
});

// @desc Replace the default checklist template for a type (admin only)
// @route PUT /api/checklists/template/:type
const updateTemplate = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { items } = req.body;

  if (!['onboarding', 'offboarding'].includes(type)) {
    res.status(400);
    throw new Error('type must be onboarding or offboarding');
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('items must be a non-empty array of checklist text');
  }

  const template = await ChecklistTemplate.findOneAndUpdate(
    { type },
    { type, items },
    { new: true, upsert: true }
  );

  res.json({ success: true, data: template });
});

// @desc List checklists — admin sees all (optionally filtered), employee sees their own
// @route GET /api/checklists?type=&status=&employee=
const getChecklists = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'employee') {
    query.employee = req.user.id;
  } else if (req.query.employee) {
    query.employee = req.query.employee;
  }
  if (req.query.type) query.type = req.query.type;
  if (req.query.status) query.status = req.query.status;

  const checklists = await EmployeeChecklist.find(query)
    .populate('employee', 'name employeeId department status')
    .populate('items.completedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: checklists.length, data: checklists });
});

// @desc Admin: start an offboarding checklist for an employee
// @route POST /api/checklists/offboarding/:employeeId
const startOffboarding = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  const existing = await EmployeeChecklist.findOne({
    employee: employee._id,
    type: 'offboarding',
    status: 'in_progress',
  });
  if (existing) {
    res.status(400);
    throw new Error('An offboarding checklist is already in progress for this employee');
  }

  const checklist = await createChecklistForEmployee(employee._id, 'offboarding');

  const io = req.app.get('io');
  if (io) io.emit('checklist:offboardingStarted', { employee, checklist });

  res.status(201).json({ success: true, data: checklist });
});

// @desc Toggle a single checklist item complete/incomplete (admin only)
// @route PATCH /api/checklists/:id/items/:itemId
const toggleItem = asyncHandler(async (req, res) => {
  const checklist = await EmployeeChecklist.findById(req.params.id);
  if (!checklist) {
    res.status(404);
    throw new Error('Checklist not found');
  }

  const item = checklist.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Checklist item not found');
  }

  item.completed = !item.completed;
  item.completedAt = item.completed ? new Date() : undefined;
  item.completedBy = item.completed ? req.user.id : undefined;

  const allDone = checklist.items.every((i) => i.completed);
  checklist.status = allDone ? 'completed' : 'in_progress';
  checklist.completedAt = allDone ? new Date() : undefined;

  await checklist.save();

  const io = req.app.get('io');
  if (io && allDone) io.emit('checklist:completed', checklist);

  res.json({ success: true, data: checklist });
});

module.exports = {
  createChecklistForEmployee,
  getTemplate,
  updateTemplate,
  getChecklists,
  startOffboarding,
  toggleItem,
};
