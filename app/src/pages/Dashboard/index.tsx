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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
};

export default Dashboard;