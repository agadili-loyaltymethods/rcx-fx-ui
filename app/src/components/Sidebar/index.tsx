import { NavLink } from 'react-router-dom';
import { useDrawer } from '../../services/drawer/useDrawer';

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
    <nav className={`bg-primary text-white transition-all duration-300 ${isDrawerOpen ? 'w-64' : 'w-16'} relative`}>
      <button 
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
        onClick={() => setDrawerState(!isDrawerOpen)}
      >
        {isDrawerOpen ? '←' : '→'}
      </button>
      
      <div className="p-4 flex flex-col gap-2">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center p-3 rounded transition-colors ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`
            }
          >
            <img 
              src={`/assets/icons/${item.icon}.svg`} 
              alt={item.label} 
              className="w-5 h-5 mr-3" 
            />
            <span className={`whitespace-nowrap transition-opacity ${isDrawerOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;