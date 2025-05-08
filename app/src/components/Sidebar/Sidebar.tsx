import { NavLink } from 'react-router-dom';
import { useDrawer } from '@/services/drawer/useDrawer';
import { useState, useEffect } from 'react';
import DashboardIcon from '../../../assets/icons/Dashboard.svg';
import IntegrationsIcon from '../../../assets/icons/integrations.svg';
import TemplatesIcon from '../../../assets/icons/Templates.svg';
import ConnectionsIcon from '../../../assets/icons/connection.svg';
import PartnersIcon from '../../../assets/icons/Partners.svg';
import RunHistoryIcon from '../../../assets/icons/run-history.svg';

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/integrations', label: 'Integrations', icon: IntegrationsIcon },
  { path: '/templates', label: 'Templates', icon: TemplatesIcon },
  { path: '/connections', label: 'Connections', icon: ConnectionsIcon },
  { path: '/partners', label: 'Partners', icon: PartnersIcon },
  { path: '/run-history', label: 'Run History', icon: RunHistoryIcon },
];

interface SidebarProps {
  isOpen?: boolean; // Optional prop to control sidebar from parent
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { isDrawerOpen, setDrawerState } = useDrawer();
  
  // Use parent prop if provided, otherwise use drawer state
  const [expanded, setExpanded] = useState(isOpen !== undefined ? isOpen : isDrawerOpen);
  
  // Sync with parent prop when it changes
  useEffect(() => {
    if (isOpen !== undefined) {
      setExpanded(isOpen);
      setDrawerState(isOpen);
    }
  }, [isOpen, setDrawerState]);
  
  // Sync with drawer state when it changes
  useEffect(() => {
    if (isOpen === undefined) {
      setExpanded(isDrawerOpen);
    }
  }, [isDrawerOpen, isOpen]);
  
  const toggleSidebar = () => {
    const newState = !expanded;
    setExpanded(newState);
    setDrawerState(newState);
  };

  return (
    <nav 
      className={`
        h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${expanded ? 'w-60' : 'w-16'}
        fixed md:relative z-40 md:z-0 
        ${!expanded ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}
      aria-expanded={expanded}
    >
      {/* Sidebar Backdrop for mobile - shown only when sidebar is open on mobile */}
      {expanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <div className="flex flex-col h-full">
        {/* Sidebar toggle button */}
        {/* <div className="flex items-center justify-end p-4 border-b border-gray-200">
          <button 
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded transition-colors"
            onClick={toggleSidebar}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div> */}
        
        {/* Navigation links */}
        <div className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${!expanded ? 'justify-center' : ''}
                  `}
                  title={item.label}
                >
                  <img 
                    src={item.icon} 
                    alt={item.label}  
                    className={`w-5 h-5 ${expanded ? 'mr-3' : ''}`} 
                    aria-hidden="true"
                  />
                  {expanded && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;