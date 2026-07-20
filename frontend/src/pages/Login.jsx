import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LuMail, LuLock, LuEye, LuEyeOff, LuBuilding2, LuUser } from 'react-icons/lu';
import { loginAdmin, loginEmployee, clearError } from '../redux/slices/authSlice';

const Login = () => {
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const onSubmit = async (formData) => {
    dispatch(clearError());
    try {
      const thunk = role === 'admin' ? loginAdmin(formData) : loginEmployee(formData);
      await dispatch(thunk).unwrap();
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-primary-600/20">
            SH
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to your workspace</p>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                role === 'admin' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600' : 'text-gray-500'
              }`}
            >
              <LuBuilding2 size={16} /> Admin / HR
            </button>
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                role === 'employee' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600' : 'text-gray-500'
              }`}
            >
              <LuUser size={16} /> Employee
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Email</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Password</label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                >
                  {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-primary-600 hover:underline">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Demo — Admin: admin@staffhub.com / Admin@123 · Employee: john@staffhub.com / Employee@123
        </p>
      </motion.div>
    </div>
  );
};

export default Login;