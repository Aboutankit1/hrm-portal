const { UAParser } = require('ua-parser-js');

// Turns a raw User-Agent string into a friendly, human-readable device summary.
//
// Note on limits: mobile browsers include real device model info (e.g. "iPhone",
// "SM-S911B") in the UA string, so phones/tablets resolve to their actual model.
// Desktop browsers do NOT expose the laptop/PC's exact model for privacy reasons —
// that information simply isn't available in a User-Agent string, on any site.
// For desktops we fall back to the best available label: OS + a friendly device name.
const parseDevice = (uaString = '') => {
  if (!uaString) {
    return { deviceType: 'unknown', deviceModel: 'Unknown device', osName: '', browserName: '' };
  }

  const { device, os, browser } = new UAParser(uaString).getResult();

  const osName = [os.name, os.version].filter(Boolean).join(' ');
  const browserName = [browser.name, browser.major].filter(Boolean).join(' ');

  // ua-parser-js device.type is 'mobile' | 'tablet' | undefined (undefined = desktop/laptop)
  let deviceType = 'laptop';
  if (device.type === 'mobile') deviceType = 'phone';
  else if (device.type === 'tablet') deviceType = 'tablet';

  let deviceModel;
  if (device.vendor || device.model) {
    // Real device model available (phones/tablets, and some branded laptops)
    deviceModel = [device.vendor, device.model].filter(Boolean).join(' ');
  } else if (os.name?.toLowerCase().includes('mac')) {
    deviceModel = 'Mac (model not exposed by browser)';
  } else if (os.name?.toLowerCase().includes('windows')) {
    deviceModel = 'Windows PC (model not exposed by browser)';
  } else if (os.name?.toLowerCase().includes('linux')) {
    deviceModel = 'Linux PC (model not exposed by browser)';
  } else {
    deviceModel = os.name ? `${os.name} device` : 'Unknown device';
  }

  return { deviceType, deviceModel, osName, browserName };
};

// Kept for any older callers that only need the coarse category.
const getDeviceType = (uaString = '') => parseDevice(uaString).deviceType;

module.exports = { parseDevice, getDeviceType };
