import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LuPlus, LuSearch, LuPencil, LuTrash2, LuBan, LuCircleCheck, LuX, LuUserMinus } from 'react-icons/lu';
import { TableSkeleton } from '../components/Loader';
import { startOffboarding } from '../redux/slices/checklistSlice';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
} from '../redux/slices/employeeSlice';
import { fetchDepartments } from '../redux/slices/departmentSlice';

const EmployeeModal = ({ employee, departments, onClose, onSaved, employeeCount, maxEmployees }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: employee || { shift: 'general', gender: 'male' },
  });
  const isEdit = !!employee;

  const onSubmit = async (data) => {
    // Check limit before submitting new employee
    if (!isEdit && employeeCount >= maxEmployees) {
      toast.error(`Free plan limit reached (${maxEmployees} employees). Please upgrade to add more.`);
      return;
    }

    try {
      if (isEdit) {
        await dispatch(updateEmployee({ id: employee._id, payload: data })).unwrap();
        toast.success('Employee updated');
      } else {
        await dispatch(createEmployee(data)).unwrap();
        toast.success('Employee added');
      }
      onSaved();
    } catch (err) {
      toast.error(err || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">{isEdit ? 'Edit Employee' : 'Add Employee'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <LuX size={20} />
          </button>
        </div>
        {!isEdit && employeeCount >= maxEmployees && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              ⚠️ You've reached the free plan limit of {maxEmployees} employees. 
              Please upgrade to add more employees.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Full Name</label>
            <input 
              className="input-field" 
              {...register('name', { required: true })} 
              disabled={!isEdit && employeeCount >= maxEmployees}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">Name is required</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                className="input-field"
                disabled={isEdit || employeeCount >= maxEmployees}
                {...register('email', { required: true })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mobile</label>
              <input 
                className="input-field" 
                {...register('mobile', { required: true })}
                disabled={!isEdit && employeeCount >= maxEmployees}
              />
            </div>
          </div>
          {!isEdit && (
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <input 
                type="password" 
                className="input-field" 
                {...register('password', { required: true, minLength: 6 })}
                disabled={employeeCount >= maxEmployees}
              />
              {errors.password && <p className="text-xs text-rose-500 mt-1">Password must be at least 6 characters</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Department</label>
              <select 
                className="input-field" 
                {...register('department')}
                disabled={!isEdit && employeeCount >= maxEmployees}
              >
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Designation</label>
              <input 
                className="input-field" 
                {...register('designation')}
                disabled={!isEdit && employeeCount >= maxEmployees}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Shift</label>
              <select 
                className="input-field" 
                {...register('shift')}
                disabled={!isEdit && employeeCount >= maxEmployees}
              >
                <option value="morning">Morning</option>
                <option value="general">General</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Salary</label>
              <input 
                type="number" 
                className="input-field" 
                {...register('salary')}
                disabled={!isEdit && employeeCount >= maxEmployees}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!isEdit && employeeCount >= maxEmployees}
            >
              {isEdit ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Employees = () => {
  const dispatch = useDispatch();
  const { list, total, isLoading } = useSelector((state) => state.employees);
  const { list: departments } = useSelector((state) => state.departments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const MAX_FREE_EMPLOYEES = 10;
  const isFreeLimitReached = total >= MAX_FREE_EMPLOYEES;

  const loadEmployees = () => {
    dispatch(fetchEmployees({ search, status: statusFilter, limit: 20 }));
  };

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(loadEmployees, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    try {
      await dispatch(deleteEmployee(id)).unwrap();
      toast.success('Employee deleted');
      loadEmployees(); // Refresh the list to update count
    } catch (err) {
      toast.error(err || 'Delete failed');
    }
  };

  const handleToggleStatus = async (emp) => {
    const action = emp.status === 'active' ? 'suspend' : 'activate';
    try {
      await dispatch(toggleEmployeeStatus({ id: emp._id, action })).unwrap();
      toast.success(`Employee ${action}d`);
    } catch (err) {
      toast.error(err || 'Failed to update status');
    }
  };

  const handleStartOffboarding = async (emp) => {
    if (!confirm(`Start offboarding for ${emp.name}? This creates an exit checklist for HR/IT to complete.`)) return;
    try {
      await dispatch(startOffboarding(emp._id)).unwrap();
      toast.success('Offboarding checklist created — find it under Onboarding & Offboarding');
    } catch (err) {
      toast.error(err || 'Failed to start offboarding');
    }
  };

  const handleAddEmployee = () => {
    if (isFreeLimitReached) {
      toast.error(`Free plan limit reached (${MAX_FREE_EMPLOYEES} employees). Please upgrade to add more.`);
      return;
    }
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Employees</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} total employees
            {isFreeLimitReached && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                ⚠️ Free limit: {MAX_FREE_EMPLOYEES}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleAddEmployee}
          className={`btn-primary flex items-center gap-2 self-start ${
            isFreeLimitReached ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isFreeLimitReached}
          title={isFreeLimitReached ? `Free limit reached (${MAX_FREE_EMPLOYEES}). Upgrade to add more.` : ''}
        >
          <LuPlus size={16} /> Add Employee
        </button>
      </div>

      {/* Free plan banner if limit reached */}
      {isFreeLimitReached && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            🔒 You've reached the free plan limit of {MAX_FREE_EMPLOYEES} employees. 
            <button 
              className="ml-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
              onClick={() => {/* Navigate to upgrade page */}}
            >
              Upgrade now →
            </button>
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LuSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field w-full pl-10"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="input-field sm:w-48" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="card p-5 overflow-x-auto">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : list.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No employees found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 font-medium">Employee</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">Designation</th>
                <th className="pb-3 font-medium">Shift</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((emp) => (
                <tr key={emp._id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-semibold">
                        {emp.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.employeeId} · {emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{emp.department?.name || '—'}</td>
                  <td className="py-3">{emp.designation}</td>
                  <td className="py-3 capitalize">{emp.shift}</td>
                  <td className="py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${
                        emp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(emp);
                          setModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        title="Edit"
                      >
                        <LuPencil size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        title={emp.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {emp.status === 'active' ? <LuBan size={15} /> : <LuCircleCheck size={15} />}
                      </button>
                      <button
                        onClick={() => handleStartOffboarding(emp)}
                        className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        title="Start Offboarding"
                      >
                        <LuUserMinus size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        title="Delete"
                      >
                        <LuTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <EmployeeModal
          employee={editing}
          departments={departments}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadEmployees();
          }}
          employeeCount={total}
          maxEmployees={MAX_FREE_EMPLOYEES}
        />
      )}
    </div>
  );
};

export default Employees;