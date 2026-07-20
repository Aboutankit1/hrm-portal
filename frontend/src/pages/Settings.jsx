import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuMapPin, LuCrosshair, LuX, LuShieldCheck, LuShieldOff } from 'react-icons/lu';
import {
  fetchOfficeLocations,
  createOfficeLocation,
  updateOfficeLocation,
  deleteOfficeLocation,
} from '../redux/slices/officeLocationSlice';

const AddOfficeModal = ({ onClose, onSaved }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(150);
  const [locating, setLocating] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
        toast.success('Location captured — stand at the office entrance for best accuracy');
      },
      () => {
        setLocating(false);
        toast.error('Could not get your location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      toast.error('Latitude and longitude are required — use "Use my current location" or enter manually');
      return;
    }
    try {
      await dispatch(
        createOfficeLocation({
          name,
          address,
          latitude: Number(latitude),
          longitude: Number(longitude),
          radiusMeters: Number(radiusMeters),
        })
      ).unwrap();
      toast.success('Office location added — swipe-in is now geofenced to this address');
      onSaved();
    } catch (err) {
      toast.error(err || 'Failed to add office location');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">Add Office Location</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <LuX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Office Name</label>
            <input
              className="input-field"
              placeholder="e.g. HQ - Delhi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Address (optional)</label>
            <input className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            <LuCrosshair size={15} /> {locating ? 'Locating…' : "Use my current location (stand at the office)"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Latitude</label>
              <input
                className="input-field"
                placeholder="28.6129"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Longitude</label>
              <input
                className="input-field"
                placeholder="77.2295"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Allowed radius (meters)</label>
            <input
              type="number"
              min={20}
              className="input-field"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Employees must be within this distance of the pin to swipe in. 100–200m works well for most offices.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Office
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Settings = () => {
  const dispatch = useDispatch();
  const { list: offices, isLoading } = useSelector((state) => state.officeLocations);
  const [companyName, setCompanyName] = useState('Staff Hub Inc.');
  const [officeTiming, setOfficeTiming] = useState('09:00 - 18:00');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchOfficeLocations());
  }, [dispatch]);

  const geofencingOn = offices.some((o) => o.isActive);

  const handleToggleActive = async (office) => {
    try {
      await dispatch(updateOfficeLocation({ id: office._id, payload: { isActive: !office.isActive } })).unwrap();
      toast.success(office.isActive ? 'Office disabled for geofencing' : 'Office enabled for geofencing');
    } catch (err) {
      toast.error(err || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this office location?')) return;
    try {
      await dispatch(deleteOfficeLocation(id)).unwrap();
      toast.success('Office location removed');
    } catch (err) {
      toast.error(err || 'Failed to remove');
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage company preferences</p>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Company Name</label>
          <input className="input-field" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Office Timing</label>
          <input className="input-field" value={officeTiming} onChange={(e) => setOfficeTiming(e.target.value)} />
        </div>
        <button className="btn-primary">Save Changes</button>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <LuMapPin size={17} /> Office Locations & Geofencing
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Employees can only swipe in from within range of an active office below.
            </p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 shrink-0 text-sm">
            <LuPlus size={15} /> Add Office
          </button>
        </div>

        <div
          className={`flex items-center gap-2 mt-4 mb-4 text-xs px-3 py-2 rounded-lg ${
            geofencingOn
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {geofencingOn ? <LuShieldCheck size={15} /> : <LuShieldOff size={15} />}
          {geofencingOn
            ? 'Geofencing is ON — employees must be near an active office to swipe in.'
            : 'Geofencing is OFF — no active office locations, employees can swipe in from anywhere.'}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : offices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No office locations added yet.</p>
        ) : (
          <div className="space-y-2">
            {offices.map((office) => (
              <div
                key={office._id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{office.name}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        office.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {office.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {office.address ? `${office.address} · ` : ''}
                    {office.latitude.toFixed(4)}, {office.longitude.toFixed(4)} · {office.radiusMeters}m radius
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(office)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700"
                  >
                    {office.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleDelete(office._id)} className="p-2 text-gray-300 hover:text-rose-500">
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <AddOfficeModal
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            dispatch(fetchOfficeLocations());
          }}
        />
      )}
    </div>
  );
};

export default Settings;
