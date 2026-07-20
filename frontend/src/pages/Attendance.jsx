import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  LuLogIn,
  LuLogOut,
  LuSmartphone,
  LuLaptop,
  LuTablet,
  LuClipboardPen,
  LuX,
  LuCheck,
  LuBan,
  LuTrash2,
} from 'react-icons/lu';
import { TableSkeleton } from '../components/Loader';
import {
  fetchAllAttendance,
  swipeIn,
  swipeOut,
  fetchTodayStatus,
  fetchMyCalendar,
} from '../redux/slices/attendanceSlice';
import {
  fetchCorrections,
  requestCorrection,
  approveCorrection,
  rejectCorrection,
  cancelCorrection,
} from '../redux/slices/correctionSlice';

const statusColor = {
  present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  half_day: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  absent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  holiday: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
};

const requestStatusColor = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const calendarDotColor = {
  present: 'bg-emerald-500',
  late: 'bg-amber-500',
  half_day: 'bg-sky-500',
  absent: 'bg-rose-500',
  leave: 'bg-blue-500',
  holiday: 'bg-violet-500',
};

const deviceIcon = {
  phone: LuSmartphone,
  tablet: LuTablet,
  laptop: LuLaptop,
  unknown: null,
};

const DeviceChip = ({ deviceType, deviceModel, osName }) => {
  if (!deviceType || deviceType === 'unknown') return <span className="text-gray-300">—</span>;
  const Icon = deviceIcon[deviceType];
  return (
    <div className="flex items-center gap-1.5">
      {Icon && <Icon size={14} className="text-gray-400 shrink-0" />}
      <div className="leading-tight">
        <p className="text-xs text-gray-700 dark:text-gray-300">{deviceModel || '—'}</p>
        {osName && <p className="text-[10px] text-gray-400">{osName}</p>}
      </div>
    </div>
  );
};

// ---------- ADMIN: daily attendance table ----------
const AdminAttendanceView = () => {
  const dispatch = useDispatch();
  const { all, isLoading } = useSelector((state) => state.attendance);
  const { list: corrections, isLoading: correctionsLoading } = useSelector((state) => state.corrections);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    dispatch(fetchAllAttendance(date));
  }, [dispatch, date]);

  useEffect(() => {
    dispatch(fetchCorrections({ status: 'pending' }));
  }, [dispatch]);

  const handleApprove = async (id) => {
    try {
      await dispatch(approveCorrection({ id })).unwrap();
      toast.success('Approved — attendance updated');
      dispatch(fetchAllAttendance(date));
    } catch (err) {
      toast.error(err || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await dispatch(rejectCorrection({ id })).unwrap();
      toast.success('Request rejected');
    } catch (err) {
      toast.error(err || 'Failed to reject');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Attendance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Every active employee for the day — including who hasn't swiped in
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field w-auto"
        />
      </div>

      {/* Pending "forgot to swipe" correction requests */}
      {!correctionsLoading && corrections.length > 0 && (
        <div className="card p-5 border-l-4 border-l-amber-400">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <LuClipboardPen size={16} className="text-amber-500" />
            Pending correction requests ({corrections.length})
          </h3>
          <div className="space-y-2">
            {corrections.map((c) => (
              <div
                key={c._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60"
              >
                <div>
                  <p className="text-sm font-medium">
                    {c.employee?.name} <span className="text-gray-400 font-normal">({c.employee?.employeeId})</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(c.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' → requesting '}
                    <span className="font-medium capitalize">{c.requestedStatus.replace('_', ' ')}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 italic">"{c.reason}"</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleApprove(c._id)}
                    className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                    title="Approve"
                  >
                    <LuCheck size={16} />
                  </button>
                  <button
                    onClick={() => handleReject(c._id)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                    title="Reject"
                  >
                    <LuBan size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5 overflow-x-auto">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : all.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No active employees found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 font-medium">Employee</th>
                <th className="pb-3 font-medium">Swipe In</th>
                <th className="pb-3 font-medium">Swipe Out</th>
                <th className="pb-3 font-medium">Device</th>
                <th className="pb-3 font-medium">Working Hours</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {all.map((rec) => (
                <tr key={rec._id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <td className="py-3">
                    <p className="font-medium">{rec.employee?.name}</p>
                    <p className="text-xs text-gray-400">{rec.employee?.employeeId}</p>
                  </td>
                  <td className="py-3">{rec.swipeInTime ? new Date(rec.swipeInTime).toLocaleTimeString() : '—'}</td>
                  <td className="py-3">{rec.swipeOutTime ? new Date(rec.swipeOutTime).toLocaleTimeString() : '—'}</td>
                  <td className="py-3">
                    <DeviceChip deviceType={rec.deviceType} deviceModel={rec.deviceModel} osName={rec.osName} />
                  </td>
                  <td className="py-3">{rec.totalWorkingHours ? `${rec.totalWorkingHours.toFixed(2)} hrs` : '—'}</td>
                  <td className="py-3">
                    {rec.status ? (
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor[rec.status]}`}>
                        {rec.status.replace('_', ' ')}
                        {rec.status === 'holiday' && rec.holidayName ? ` · ${rec.holidayName}` : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ---------- Modal: employee requests a correction ----------
const RequestCorrectionModal = ({ defaultDate, onClose, onSaved }) => {
  const dispatch = useDispatch();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(defaultDate || today);
  const [requestedStatus, setRequestedStatus] = useState('present');
  const [swipeInTime, setSwipeInTime] = useState('');
  const [swipeOutTime, setSwipeOutTime] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        requestCorrection({
          date,
          requestedStatus,
          requestedSwipeInTime: swipeInTime,
          requestedSwipeOutTime: swipeOutTime,
          reason,
        })
      ).unwrap();
      toast.success('Request sent to admin for approval');
      onSaved();
    } catch (err) {
      toast.error(err || 'Failed to submit request');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">Request Attendance Correction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <LuX size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Forgot to swipe in or out? Tell your admin what happened — they'll review and mark the day for you.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Date</label>
            <input
              type="date"
              className="input-field"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Mark this day as</label>
            <select className="input-field" value={requestedStatus} onChange={(e) => setRequestedStatus(e.target.value)}>
              <option value="present">Present (full day)</option>
              <option value="half_day">Half day</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Swipe-in time (optional)</label>
              <input type="time" className="input-field" value={swipeInTime} onChange={(e) => setSwipeInTime(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Swipe-out time (optional)</label>
              <input type="time" className="input-field" value={swipeOutTime} onChange={(e) => setSwipeOutTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Reason</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="e.g. Forgot to swipe in — was in the office by 9:10 AM"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Send to Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------- EMPLOYEE: swipe in/out + calendar + my correction requests ----------
const EmployeeAttendanceView = () => {
  const dispatch = useDispatch();
  const { today, calendar } = useSelector((state) => state.attendance);
  const { list: myCorrections } = useSelector((state) => state.corrections);
  const now = new Date();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);

  useEffect(() => {
    dispatch(fetchTodayStatus());
    dispatch(fetchMyCalendar({ month: now.getMonth() + 1, year: now.getFullYear() }));
    dispatch(fetchCorrections());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleSwipeIn = async () => {
    try {
      await dispatch(swipeIn()).unwrap();
      toast.success('Swiped in!');
    } catch (err) {
      toast.error(err || 'Swipe in failed');
    }
  };

  const handleSwipeOut = async () => {
    try {
      await dispatch(swipeOut()).unwrap();
      toast.success('Swiped out!');
    } catch (err) {
      toast.error(err || 'Swipe out failed');
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      await dispatch(cancelCorrection(id)).unwrap();
      toast.success('Request cancelled');
    } catch (err) {
      toast.error(err || 'Failed to cancel');
    }
  };

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOffset = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  const dayByNumber = {};
  calendar.forEach((d) => {
    dayByNumber[Number(d.date.split('-')[2])] = d;
  });

  const openCorrectionModal = (dateStr) => {
    setModalDate(dateStr || null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">My Attendance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Missed days auto-mark as Absent unless you're on approved leave or it's a holiday
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSwipeIn} disabled={!!today?.swipeInTime} className="btn-primary flex items-center gap-2">
            <LuLogIn size={16} /> Swipe In
          </button>
          <button
            onClick={handleSwipeOut}
            disabled={!today?.swipeInTime || !!today?.swipeOutTime}
            className="btn-secondary flex items-center gap-2"
          >
            <LuLogOut size={16} /> Swipe Out
          </button>
          <button onClick={() => openCorrectionModal(null)} className="btn-secondary flex items-center gap-2">
            <LuClipboardPen size={16} /> Forgot to swipe?
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            {now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs">
            {Object.entries(calendarDotColor).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="capitalize text-gray-500 dark:text-gray-400">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayData = dayByNumber[day];
            const status = dayData?.status;
            const isToday = day === now.getDate();
            const isClickable = status === 'absent';
            return (
              <button
                type="button"
                key={day}
                disabled={!isClickable}
                onClick={() => isClickable && openCorrectionModal(dayData.date)}
                title={
                  status === 'holiday' && dayData?.holidayName
                    ? dayData.holidayName
                    : isClickable
                    ? 'Absent — click to request a correction'
                    : status
                    ? status.replace('_', ' ')
                    : undefined
                }
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs border ${
                  isToday ? 'border-primary-500' : 'border-transparent'
                } ${status ? 'bg-gray-50 dark:bg-gray-800/60' : ''} ${
                  isClickable ? 'cursor-pointer hover:ring-2 hover:ring-rose-300' : 'cursor-default'
                }`}
              >
                <span>{day}</span>
                {status && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${calendarDotColor[status]}`} />}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">Tip: click any red "Absent" day above to request a correction for it.</p>
      </div>

      {myCorrections.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-3">My correction requests</h3>
          <div className="space-y-2">
            {myCorrections.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(c.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' → '}
                    <span className="capitalize">{c.requestedStatus.replace('_', ' ')}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 italic">"{c.reason}"</p>
                  {c.reviewNote && <p className="text-xs text-gray-400 mt-0.5">Admin note: {c.reviewNote}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${requestStatusColor[c.status]}`}>
                    {c.status}
                  </span>
                  {c.status === 'pending' && (
                    <button onClick={() => handleCancelRequest(c._id)} className="text-gray-300 hover:text-rose-500">
                      <LuTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <RequestCorrectionModal
          defaultDate={modalDate}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            dispatch(fetchCorrections());
          }}
        />
      )}
    </div>
  );
};

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);
  return user?.role === 'employee' ? <EmployeeAttendanceView /> : <AdminAttendanceView />;
};

export default Attendance;
