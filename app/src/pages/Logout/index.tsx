import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/auth/useAuth';

const Logout: React.FC = () => {
  const { logoutUser } = useAuth();
  
  useEffect(() => {
    // Perform logout when component mounts
    const performLogout = async () => {
      await logoutUser();
    };
    
    performLogout();
  }, [logoutUser]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <p className="mb-4">Successfully Logged Out from the Application</p>
      <p>
        Click <Link to="/login" className="text-blue-600 hover:underline">here</Link> to re-login
      </p>
    </div>
  );
};

export default Logout;