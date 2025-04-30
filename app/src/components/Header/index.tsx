import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const { logoutUser } = useAuthContext();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/assets/logo.svg" alt="Logo" />
      </div>
      <div className={styles.actions}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;