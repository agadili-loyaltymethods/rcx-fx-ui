import { useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }
  }, [isLoggedIn]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard content */}
      </div>
    </div>
  );
};

export default Dashboard;