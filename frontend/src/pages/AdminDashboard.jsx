import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LuUsers,
  LuUserCheck,
  LuUserX,
  LuClock3,
  LuBuilding2,
  LuListTodo,
  LuCircleCheck,
  LuCircleDashed,
} from 'react-icons/lu';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import StatCard from '../components/StatCard';
import { CardSkeleton } from '../components/Loader';
import { fetchAttendanceStats } from '../redux/slices/attendanceSlice';
import { fetchEmployees } from '../redux/slices/employeeSlice';
import { fetchDepartments } from '../redux/slices/departmentSlice';
import { fetchTasks } from '../redux/slices/taskSlice';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.attendance);
  const { total: totalEmployees } = useSelector((state) => state.employees);
  const { list: departments } = useSelector((state) => state.departments);
  const { list: tasks } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchAttendanceStats());
    dispatch(fetchEmployees({ limit: 1 }));
    dispatch(fetchDepartments());
    dispatch(fetchTasks());
  }, [dispatch]);

  const pendingTasks = tasks.filter((t) => !['completed', 'cancelled'].includes(t.status)).length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const attendanceTrend = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Present',
        // Historical days are illustrative until a /attendance/weekly-trend endpoint is added;
        // today's value comes from live stats.
        data: [32, 35, 30, 38, 34, 10, stats?.present || 0],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const taskDoughnut = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [
          tasks.filter((t) => t.status === 'pending').length,
          tasks.filter((t) => ['accepted', 'in_progress', 'review'].includes(t.status)).length,
          completedTasks,
        ],
        backgroundColor: ['#f59e0b', '#6366f1', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your organization today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={LuUsers} label="Total Employees" value={stats.totalEmployees} color="indigo" delay={0} />
        <StatCard icon={LuUserCheck} label="Present Today" value={stats.present} color="green" delay={0.05} />
        <StatCard icon={LuUserX} label="Absent Today" value={stats.absent} color="red" delay={0.1} />
        <StatCard icon={LuClock3} label="Late Employees" value={stats.late} color="yellow" delay={0.15} />
        <StatCard icon={LuBuilding2} label="Departments" value={departments.length} color="blue" delay={0.2} />
        <StatCard icon={LuListTodo} label="Total Tasks" value={tasks.length} color="purple" delay={0.25} />
        <StatCard icon={LuCircleDashed} label="Pending Tasks" value={pendingTasks} color="yellow" delay={0.3} />
        <StatCard icon={LuCircleCheck} label="Completed Tasks" value={completedTasks} color="green" delay={0.35} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Weekly Attendance Trend</h3>
          <Line
            data={attendanceTrend}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
            height={220}
          />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Task Breakdown</h3>
          <Doughnut data={taskDoughnut} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
