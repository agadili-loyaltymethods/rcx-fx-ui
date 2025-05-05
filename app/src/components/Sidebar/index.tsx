import { NavLink } from 'react-router-dom';
// import { useDrawer } from '../../services/drawer/useDrawer';
import styles from './Sidebar.module.css';
import { useDrawer } from '@/services/drawer/useDrawer';

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/integrations', label: 'Integrations', icon: 'integrations' },
  { path: '/templates', label: 'Templates', icon: 'templates' },
  { path: '/connections', label: 'Connections', icon: 'connection' },
  { path: '/partners', label: 'Partners', icon: 'partners' },
  { path: '/run-history', label: 'Run History', icon: 'run-history' },
];

const Sidebar = () => {
  const { isDrawerOpen, setDrawerState } = useDrawer();

  return (
    <nav className={`${styles.sidebar} ${isDrawerOpen ? styles.open : ''}`}>
      <button 
        className={styles.toggleButton}
        onClick={() => setDrawerState(!isDrawerOpen)}
      >
        {isDrawerOpen ? '←' : '→'}
      </button>
      
      <div className={styles.links}>
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <img 
              src={`/assets/icons/${item.icon}.svg`} 
              alt={item.label} 
              className={styles.icon} 
            />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;