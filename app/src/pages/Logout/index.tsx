import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logoutUser } = useAuthContext();

  useEffect(() => {
    const performLogout = async () => {
      await logoutUser();
      navigate('/login');
    };

    performLogout();
  }, [logoutUser, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      Logging out...
    </div>
  );
};

export default Logout;