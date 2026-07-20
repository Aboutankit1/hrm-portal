import { NavLink } from 'react-router-dom';
import {
  LuLayoutDashboard,
  LuUsers,
  LuCalendarCheck,
  LuListTodo,
  LuBuilding2,
  LuFileChartColumn,
  LuSettings,
  LuX,
  LuCalendarClock,
  LuCalendarHeart,
  LuUserPlus,
} from 'react-icons/lu';
import { useSelector } from 'react-redux';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { to: '/employees', label: 'Employees', icon: LuUsers },
  { to: '/departments', label: 'Departments', icon: LuBuilding2 },
  { to: '/attendance', label: 'Attendance', icon: LuCalendarCheck },
  { to: '/holidays', label: 'Holidays', icon: LuCalendarHeart },
  { to: '/checklists', label: 'Onboarding/Offboarding', icon: LuUserPlus },
  { to: '/tasks', label: 'Tasks', icon: LuListTodo },
  { to: '/leaves', label: 'Leave Requests', icon: LuCalendarClock },
  { to: '/reports', label: 'Reports', icon: LuFileChartColumn },
  { to: '/settings', label: 'Settings', icon: LuSettings },
];

const employeeLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: LuCalendarCheck },
  { to: '/tasks', label: 'My Tasks', icon: LuListTodo },
  { to: '/leaves', label: 'My Leaves', icon: LuCalendarClock },
  { to: '/profile', label: 'Profile', icon: LuSettings },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const links = user?.role === 'employee' ? employeeLinks : adminLinks;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
              SH
            </div>
            <span className="font-bold text-lg">Staff Hub</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500">
            <LuX size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          Staff Hub v1.0 &copy; {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
