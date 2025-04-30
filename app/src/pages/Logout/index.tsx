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
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      Logging out...
    </div>
  );
};

export default Logout;