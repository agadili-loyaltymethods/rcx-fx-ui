import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { logoutUser } = useAuthContext();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
      <div className="h-10">
        <img src="/assets/logo.svg" alt="Logo" className="h-full" />
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;