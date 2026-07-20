const mongoose = require('mongoose');

const officeLocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "HQ - Delhi"
    address: { type: String, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radiusMeters: { type: Number, required: true, default: 150, min: 20 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OfficeLocation', officeLocationSchema);
