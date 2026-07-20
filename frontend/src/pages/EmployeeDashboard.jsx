import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LuLogIn, LuLogOut, LuClock, LuListTodo, LuCircleCheck } from 'react-icons/lu';
import { swipeIn, swipeOut, fetchTodayStatus } from '../redux/slices/attendanceSlice';
import { fetchTasks } from '../redux/slices/taskSlice';

const useLiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const formatDuration = (ms) => {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { today } = useSelector((state) => state.attendance);
  const { list: tasks } = useSelector((state) => state.tasks);
  const now = useLiveClock();

  useEffect(() => {
    dispatch(fetchTodayStatus());
    dispatch(fetchTasks());
  }, [dispatch]);

  const isSwipedIn = today?.swipeInTime && !today?.swipeOutTime;
  const isSwipedOut = today?.swipeInTime && today?.swipeOutTime;

  const elapsed = useMemo(() => {
    if (!today?.swipeInTime) return 0;
    const end = today.swipeOutTime ? new Date(today.swipeOutTime) : now;
    return end - new Date(today.swipeInTime);
  }, [today, now]);

  const handleSwipeIn = async () => {
    try {
      await dispatch(swipeIn()).unwrap();
      toast.success('Swiped in successfully!');
    } catch (err) {
      toast.error(err || 'Swipe in failed');
    }
  };

  const handleSwipeOut = async () => {
    try {
      await dispatch(swipeOut()).unwrap();
      toast.success('Swiped out successfully!');
    } catch (err) {
      toast.error(err || 'Swipe out failed');
    }
  };

  const myTasks = tasks;
  const todaysTasks = myTasks.filter((t) => !['completed', 'cancelled'].includes(t.status));
  const completedTasks = myTasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Hello, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 lg:col-span-2 flex flex-col items-center justify-center text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Time</p>
          <p className="text-4xl font-bold tracking-tight mb-4">{now.toLocaleTimeString()}</p>

          <div className="flex items-center gap-2 text-primary-600 mb-6">
            <LuClock size={18} />
            <span className="font-mono text-lg font-semibold">{formatDuration(elapsed)}</span>
            <span className="text-xs text-gray-400">working time</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSwipeIn}
              disabled={!!today?.swipeInTime}
              className="btn-primary flex items-center gap-2"
            >
              <LuLogIn size={16} /> Swipe In
            </button>
            <button
              onClick={handleSwipeOut}
              disabled={!isSwipedIn}
              className="btn-secondary flex items-center gap-2"
            >
              <LuLogOut size={16} /> Swipe Out
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            {isSwipedOut
              ? `Completed — worked ${today.totalWorkingHours?.toFixed(2)} hrs today`
              : isSwipedIn
              ? 'You are currently checked in'
              : 'You have not swiped in today'}
          </p>
        </motion.div>

        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
              <LuListTodo size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold">{todaysTasks.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending Tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <LuCircleCheck size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTasks.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed Tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Today's Tasks</h3>
        {todaysTasks.length === 0 ? (
          <p className="text-sm text-gray-400">No pending tasks — you're all caught up!</p>
        ) : (
          <div className="space-y-2">
            {todaysTasks.slice(0, 5).map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60"
              >
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.deadline && (
                    <p className="text-xs text-gray-400">
                      Due {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 capitalize">
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
