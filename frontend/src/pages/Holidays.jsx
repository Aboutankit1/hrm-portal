import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuCalendarHeart, LuX } from 'react-icons/lu';
import { fetchHolidays, createHoliday, deleteHoliday } from '../redux/slices/holidaySlice';

const Holidays = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.holidays);
  const [year, setYear] = useState(new Date().getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchHolidays({ year }));
  }, [dispatch, year]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createHoliday({ date, name, description })).unwrap();
      toast.success('Holiday added — it will show up on everyone\'s calendar');
      setModalOpen(false);
      setDate('');
      setName('');
      setDescription('');
    } catch (err) {
      toast.error(err || 'Failed to add holiday');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this holiday?')) return;
    try {
      await dispatch(deleteHoliday(id)).unwrap();
      toast.success('Holiday removed');
    } catch (err) {
      toast.error(err || 'Failed to remove holiday');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Holidays</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Holidays you add here automatically show up on every employee's attendance calendar.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="input-field w-auto"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <LuPlus size={16} /> Add Holiday
          </button>
        </div>
      </div>

      <div className="card p-5">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <LuCalendarHeart size={28} className="mx-auto mb-2 opacity-50" />
            No holidays added for {year} yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {list.map((h) => (
              <div key={h._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 flex flex-col items-center justify-center text-xs font-semibold shrink-0">
                    <span>{new Date(h.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                    <span className="text-sm">{new Date(h.date).getDate()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{h.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(h.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {h.description && <p className="text-xs text-gray-400 mt-0.5">{h.description}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(h._id)} className="p-2 text-gray-300 hover:text-rose-500">
                  <LuTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Add Holiday</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <LuX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Holiday Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Independence Day"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (optional)</label>
                <textarea className="input-field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
