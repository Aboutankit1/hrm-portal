import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
    <p className="text-7xl font-bold text-primary-600 mb-2">404</p>
    <h1 className="text-xl font-semibold mb-2">Page not found</h1>
    <p className="text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary">
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
