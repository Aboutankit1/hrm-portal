const asyncHandler = require('express-async-handler');
const OfficeLocation = require('../models/OfficeLocation');

// @desc Get all office locations
// @route GET /api/office-locations
const getOfficeLocations = asyncHandler(async (req, res) => {
  const offices = await OfficeLocation.find().sort({ createdAt: -1 });
  res.json({ success: true, count: offices.length, data: offices });
});

// @desc Add an office location (admin only) — swipe-in geofencing turns on
//       automatically once at least one active office location exists
// @route POST /api/office-locations
const createOfficeLocation = asyncHandler(async (req, res) => {
  const { name, address, latitude, longitude, radiusMeters } = req.body;

  if (!name || latitude === undefined || longitude === undefined) {
    res.status(400);
    throw new Error('name, latitude and longitude are required');
  }

  const office = await OfficeLocation.create({
    name,
    address,
    latitude,
    longitude,
    radiusMeters: radiusMeters || 150,
  });

  res.status(201).json({ success: true, data: office });
});

// @desc Update an office location (admin only)
// @route PUT /api/office-locations/:id
const updateOfficeLocation = asyncHandler(async (req, res) => {
  const office = await OfficeLocation.findById(req.params.id);
  if (!office) {
    res.status(404);
    throw new Error('Office location not found');
  }

  const { name, address, latitude, longitude, radiusMeters, isActive } = req.body;
  if (name !== undefined) office.name = name;
  if (address !== undefined) office.address = address;
  if (latitude !== undefined) office.latitude = latitude;
  if (longitude !== undefined) office.longitude = longitude;
  if (radiusMeters !== undefined) office.radiusMeters = radiusMeters;
  if (isActive !== undefined) office.isActive = isActive;

  await office.save();
  res.json({ success: true, data: office });
});

// @desc Delete an office location (admin only)
// @route DELETE /api/office-locations/:id
const deleteOfficeLocation = asyncHandler(async (req, res) => {
  const office = await OfficeLocation.findById(req.params.id);
  if (!office) {
    res.status(404);
    throw new Error('Office location not found');
  }
  await office.deleteOne();
  res.json({ success: true, message: 'Office location removed' });
});

module.exports = { getOfficeLocations, createOfficeLocation, updateOfficeLocation, deleteOfficeLocation };
