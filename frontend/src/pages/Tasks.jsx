import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LuPlus, LuX, LuTrash2, LuCalendar } from 'react-icons/lu';
import { TableSkeleton } from '../components/Loader';
import { fetchTasks, createTask, updateTaskStatus, deleteTask } from '../redux/slices/taskSlice';
import { fetchEmployees } from '../redux/slices/employeeSlice';

const priorityColor = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const statusOptions = ['pending', 'accepted', 'in_progress', 'review', 'completed', 'cancelled'];

const statusColor = {
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  accepted: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  in_progress: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const CreateTaskModal = ({ employees, onClose, onSaved }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { priority: 'medium' },
  });

  const onSubmit = async (data) => {
    try {
      const assignedTo = Array.isArray(data.assignedTo) ? data.assignedTo : [data.assignedTo];
      await dispatch(createTask({ ...data, assignedTo })).unwrap();
      toast.success('Task created and assigned');
      onSaved();
    } catch (err) {
      toast.error(err || 'Failed to create task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">Create Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <LuX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <input className="input-field" {...register('title', { required: true })} />
            {errors.title && <p className="text-xs text-rose-500 mt-1">Title is required</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea className="input-field" rows={3} {...register('description')} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Assign To</label>
            <select multiple className="input-field h-28" {...register('assignedTo', { required: true })}>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple employees</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <select className="input-field" {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Deadline</label>
              <input type="date" className="input-field" {...register('deadline')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Tasks = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.tasks);
  const { list: employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const isAdmin = user?.role !== 'employee';

  const loadTasks = () => dispatch(fetchTasks());

  useEffect(() => {
    loadTasks();
    if (isAdmin) dispatch(fetchEmployees({ limit: 100, status: 'active' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateTaskStatus({ id, status })).unwrap();
      toast.success('Task status updated');
    } catch (err) {
      toast.error(err || 'Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await dispatch(deleteTask(id)).unwrap();
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{isAdmin ? 'Task Management' : 'My Tasks'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{list.length} tasks</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <LuPlus size={16} /> Create Task
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="card p-5">
          <TableSkeleton rows={5} cols={4} />
        </div>
      ) : list.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No tasks yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((task) => (
            <div key={task._id} className="card p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold">{task.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full capitalize shrink-0 ${priorityColor[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{task.description}</p>
              )}

              {task.assignedTo?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {task.assignedTo.map((emp) => (
                    <span
                      key={emp._id}
                      className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    >
                      {emp.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  {task.deadline && (
                    <>
                      <LuCalendar size={13} /> {new Date(task.deadline).toLocaleDateString()}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className={`text-xs px-2 py-1.5 rounded-lg border-0 capitalize cursor-pointer ${statusColor[task.status]}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {isAdmin && (
                    <button onClick={() => handleDelete(task._id)} className="text-gray-300 hover:text-rose-500">
                      <LuTrash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CreateTaskModal
          employees={employees}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadTasks();
          }}
        />
      )}
    </div>
  );
};

export default Tasks;
