import { useState } from 'react';
import { LuMenu, LuMoon, LuSun, LuLogOut, LuBell, LuChevronDown } from 'react-icons/lu';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logoutUser } from '../redux/slices/authSlice';

const Navbar = ({ onMenuClick, darkMode, onToggleDark }) => {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-gray-500">
          <LuMenu size={22} />
        </button>
        <h1 className="font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">
          Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleDark}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {darkMode ? <LuSun size={18} /> : <LuMoon size={18} />}
        </button>
        <button className="w-9 h-9 relative flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
          <LuBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <LuChevronDown size={16} className="text-gray-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 card p-1 shadow-lg z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg mt-1"
              >
                <LuLogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
