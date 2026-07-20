import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold">My Profile</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage your account details</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.name}</h3>
            <p className="text-sm text-gray-400">{user?.designation || user?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">Employee ID</p>
            <p className="font-medium">{user?.employeeId || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Mobile</p>
            <p className="font-medium">{user?.mobile || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Shift</p>
            <p className="font-medium capitalize">{user?.shift || '—'}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Change Password</h3>
        <p className="text-sm text-gray-400">Password management coming soon.</p>
      </div>
    </div>
  );
};

export default Profile;
