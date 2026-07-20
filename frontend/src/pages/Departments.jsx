import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuBuilding2, LuUsers, LuX } from 'react-icons/lu';
import { fetchDepartments, createDepartment, deleteDepartment } from '../redux/slices/departmentSlice';

const Departments = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.departments);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createDepartment({ name, description })).unwrap();
      toast.success('Department created');
      setModalOpen(false);
      setName('');
      setDescription('');
    } catch (err) {
      toast.error(err || 'Failed to create department');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await dispatch(deleteDepartment(id)).unwrap();
      toast.success('Department deleted');
    } catch (err) {
      toast.error(err || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Departments</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{list.length} departments</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <LuPlus size={16} /> Add Department
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5 h-28 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((dept) => (
            <div key={dept._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
                  <LuBuilding2 size={18} />
                </div>
                <button
                  onClick={() => handleDelete(dept._id)}
                  className="text-gray-300 hover:text-rose-500"
                >
                  <LuTrash2 size={15} />
                </button>
              </div>
              <h3 className="font-semibold">{dept.name}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{dept.description || 'No description'}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-3">
                <LuUsers size={13} /> {dept.employeeCount} employees
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">Add Department</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <LuX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
