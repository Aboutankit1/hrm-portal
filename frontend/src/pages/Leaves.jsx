import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LuPlus, LuX, LuCheck, LuBan, LuTrash2, LuCalendarClock } from 'react-icons/lu';
import { TableSkeleton } from '../components/Loader';
import { fetchLeaves, applyLeave, approveLeave, rejectLeave, cancelLeave } from '../redux/slices/leaveSlice';

const leaveTypeLabel = {
  sick: 'Sick Leave',
  casual: 'Casual Leave',
  paid: 'Paid Leave',
  half_day: 'Half Day Leave',
};

const statusColor = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const ApplyLeaveModal = ({ onClose, onSaved }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { leaveType: 'casual' } });

  const onSubmit = async (data) => {
    try {
      await dispatch(applyLeave(data)).unwrap();
      toast.success('Leave request submitted');
      onSaved();
    } catch (err) {
      toast.error(err || 'Failed to submit leave request');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">Apply for Leave</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <LuX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Leave Type</label>
            <select className="input-field" {...register('leaveType', { required: true })}>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="paid">Paid Leave</option>
              <option value="half_day">Half Day Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <input type="date" className="input-field" {...register('startDate', { required: true })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <input type="date" className="input-field" {...register('endDate', { required: true })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Reason</label>
            <textarea className="input-field" rows={3} {...register('reason', { required: true })} />
            {errors.reason && <p className="text-xs text-rose-500 mt-1">Reason is required</p>}
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Leaves = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.leaves);
  const { user } = useSelector((state) => state.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const isAdmin = user?.role !== 'employee';

  const loadLeaves = () => dispatch(fetchLeaves(statusFilter ? { status: statusFilter } : {}));

  useEffect(() => {
    loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await dispatch(approveLeave({ id })).unwrap();
      toast.success('Leave approved');
    } catch (err) {
      toast.error(err || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await dispatch(rejectLeave({ id })).unwrap();
      toast.success('Leave rejected');
    } catch (err) {
      toast.error(err || 'Failed to reject');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this leave request?')) return;
    try {
      await dispatch(cancelLeave(id)).unwrap();
      toast.success('Leave request cancelled');
    } catch (err) {
      toast.error(err || 'Failed to cancel');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{isAdmin ? 'Leave Requests' : 'My Leaves'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAdmin ? 'Review and approve employee leave requests' : 'Apply for leave and track your requests'}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="input-field w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          {!isAdmin && (
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 shrink-0">
              <LuPlus size={16} /> Apply Leave
            </button>
          )}
        </div>
      </div>

      <div className="card p-5 overflow-x-auto">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : list.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <LuCalendarClock size={28} className="mx-auto mb-2 opacity-50" />
            No leave requests found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                {isAdmin && <th className="pb-3 font-medium">Employee</th>}
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Dates</th>
                <th className="pb-3 font-medium">Days</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((leave) => (
                <tr key={leave._id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 align-top">
                  {isAdmin && (
                    <td className="py-3">
                      <p className="font-medium">{leave.employee?.name}</p>
                      <p className="text-xs text-gray-400">{leave.employee?.employeeId}</p>
                    </td>
                  )}
                  <td className="py-3">{leaveTypeLabel[leave.leaveType]}</td>
                  <td className="py-3 whitespace-nowrap">
                    {new Date(leave.startDate).toLocaleDateString()} –{' '}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3">{leave.totalDays}</td>
                  <td className="py-3 max-w-[200px] truncate" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor[leave.status]}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && leave.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(leave._id)}
                            className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            title="Approve"
                          >
                            <LuCheck size={15} />
                          </button>
                          <button
                            onClick={() => handleReject(leave._id)}
                            className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            title="Reject"
                          >
                            <LuBan size={15} />
                          </button>
                        </>
                      )}
                      {!isAdmin && leave.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(leave._id)}
                          className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                          title="Cancel"
                        >
                          <LuTrash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <ApplyLeaveModal
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadLeaves();
          }}
        />
      )}
    </div>
  );
};

export default Leaves;
