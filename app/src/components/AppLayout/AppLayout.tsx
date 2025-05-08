import React, { useState, useEffect } from 'react';
import './AppLayout.css';

// Import SVG icons
// import DashboardIcon from '../../../assets/icons/Dashboard.svg';
// import PartnersIcon from '../../../assets/icons/Partners.svg';
// import ConnectionIcon from '../../../assets/icons/connection.svg';
// import TemplatesIcon from '../../../assets/icons/Templates.svg';
// import IntegrationsIcon from '../../../assets/icons/integrations.svg';
// import RunHistoryIcon from '../../../assets/icons/run-history.svg';
import { useAuth } from '@/hooks/useAuth';
import { useLoader } from '@/services/loader/useLoader';
import { useUtils } from '@/services/utils/useUtils';
import AppRoutes from '@/routes/AppRoutes';
import axios from 'axios';
import HeaderAndSidebar from '../HeaderAndSidebar/HeaderAndSidebar';
import { useSelector } from 'react-redux';

const drawerWidth = 240;

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const [trustedLogo, setTrustedLogo] = useState<string>('');
    const { isLoggedIn } = useAuth();
    const { setSidebarState, checkPerms } = useUtils();
    const { isLoading } = useLoader();
    const isSidebarOpened = useSelector((state: any) => state.auth?.isSideBarOpened);
    
    useEffect(() => {
      // Set initial sidebar state
      setSidebarState(true);
      fetchLogo();
    }, [setSidebarState, isSidebarOpen]);
  
    const fetchLogo = async () => {
      try {
        const response: any = await axios.get('/assets/logo.svg', { responseType: 'text' });
        setTrustedLogo(response.data);
      } catch (error) {
        console.error('Failed to load logo:', error);
      }
    };
  
    const toggleSidebar = () => {
      const newState = !isSidebarOpen;
      setSidebarOpen(newState);
      setSidebarState(newState);
    };
  
    // Navigation items with their routes and permission checks
    const navItems = [
      { 
        text: 'Dashboard', 
        icon: 'dashboard', 
        route: '/dashboard', 
        permissions: null 
      },
      { 
        text: 'Partners', 
        icon: 'partners', 
        route: '/partners', 
        permissions: { FX_Partner: ['read'] } 
      },
      { 
        text: 'Connections', 
        icon: 'connection', 
        route: '/connections', 
        permissions: { FX_Connection: ['read'] } 
      },
      { 
        text: 'Templates', 
        icon: 'templates', 
        route: '/templates', 
        permissions: { FX_IntegrationTemplate: ['read'] } 
      },
      { 
        text: 'Integrations', 
        icon: 'integrations', 
        route: '/integrations', 
        permissions: { FX_Integration: ['read'] } 
      },
      { 
        text: 'Run History', 
        icon: 'run-history', 
        route: '/run-history', 
        permissions: { FX_RunHistory: ['read'] } 
      }
    ];
  
    // SVG icons mapping
    const icons: { [key: string]: JSX.Element } = {
      dashboard: (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 16H14M9.0177 1.76401L2.23539 7.03914C1.78202 7.39176 1.55534 7.56807 1.39203 7.78887C1.24737 7.98446 1.1396 8.2048 1.07403 8.43907C1 8.70353 1 8.99071 1 9.56507V16.8C1 17.9201 1 18.4802 1.21799 18.908C1.40973 19.2843 1.71569 19.5903 2.09202 19.782C2.51984 20 3.07989 20 4.2 20H15.8C16.9201 20 17.4802 20 17.908 19.782C18.2843 19.5903 18.5903 19.2843 18.782 18.908C19 18.4802 19 17.9201 19 16.8V9.56507C19 8.99071 19 8.70353 18.926 8.43907C18.8604 8.2048 18.7526 7.98446 18.608 7.78887C18.4447 7.56807 18.218 7.39176 17.7646 7.03914L10.9823 1.76401C10.631 1.49076 10.4553 1.35413 10.2613 1.30162C10.0902 1.25528 9.9098 1.25528 9.73865 1.30162C9.54468 1.35413 9.36902 1.49076 9.0177 1.76401Z" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        // <DashboardIcon></DashboardIcon>
      ),
      partners: (
        <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 19V17C21 15.1362 19.7252 13.5701 18 13.126M14.5 1.29076C15.9659 1.88415 17 3.32131 17 5C17 6.67869 15.9659 8.11585 14.5 8.70924M16 19C16 17.1362 16 16.2044 15.6955 15.4693C15.2895 14.4892 14.5108 13.7105 13.5307 13.3045C12.7956 13 11.8638 13 10 13H7C5.13623 13 4.20435 13 3.46927 13.3045C2.48915 13.7105 1.71046 14.4892 1.30448 15.4693C1 16.2044 1 17.1362 1 19M12.5 5C12.5 7.20914 10.7091 9 8.5 9C6.29086 9 4.5 7.20914 4.5 5C4.5 2.79086 6.29086 1 8.5 1C10.7091 1 12.5 2.79086 12.5 5Z" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        // <PartnersIcon></PartnersIcon>
      ),
      connection: (
        <svg width="22" height="12" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5 1H6C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11H8C10.7614 11 13 8.76142 13 6M15.5 11H16C18.7614 11 21 8.76143 21 6C21 3.23858 18.7614 1 16 1H14C11.2386 1 9 3.23858 9 6" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        // <ConnectionIcon></ConnectionIcon>
      ),
      templates: (
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 10H5M7 14H5M13 6H5M17 5.8V16.2C17 17.8802 17 18.7202 16.673 19.362C16.3854 19.9265 15.9265 20.3854 15.362 20.673C14.7202 21 13.8802 21 12.2 21H5.8C4.11984 21 3.27976 21 2.63803 20.673C2.07354 20.3854 1.6146 19.9265 1.32698 19.362C1 18.7202 1 17.8802 1 16.2V5.8C1 4.11984 1 3.27976 1.32698 2.63803C1.6146 2.07354 2.07354 1.6146 2.63803 1.32698C3.27976 1 4.11984 1 5.8 1H12.2C13.8802 1 14.7202 1 15.362 1.32698C15.9265 1.6146 16.3854 2.07354 16.673 2.63803C17 3.27976 17 4.11984 17 5.8Z" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        // <TemplatesIcon></TemplatesIcon>
      ),
      integrations: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.2 21C20.48 21 20.62 21 20.727 20.9455C20.8211 20.8976 20.8976 20.8211 20.9455 20.727C21 20.62 21 20.48 21 20.2V9.8C21 9.51997 21 9.37996 20.9455 9.27301C20.8976 9.17893 20.8211 9.10244 20.727 9.0545C20.62 9 20.48 9 20.2 9L17.8 9C17.52 9 17.38 9 17.273 9.0545C17.1789 9.10243 17.1024 9.17892 17.0545 9.27301C17 9.37996 17 9.51997 17 9.8V12.2C17 12.48 17 12.62 16.9455 12.727C16.8976 12.8211 16.8211 12.8976 16.727 12.9455C16.62 13 16.48 13 16.2 13H13.8C13.52 13 13.38 13 13.273 13.0545C13.1789 13.1024 13.1024 13.1789 13.0545 13.273C13 13.38 13 13.52 13 13.8V16.2C13 16.48 13 16.62 12.9455 16.727C12.8976 16.8211 12.8211 16.8976 12.727 16.9455C12.62 17 12.48 17 12.2 17H9.8C9.51997 17 9.37996 17 9.273 17.0545C9.17892 17.1024 9.10243 17.1789 9.0545 17.273C9 17.38 9 17.52 9 17.8V20.2C9 20.48 9 20.62 9.0545 20.727C9.10243 20.8211 9.17892 20.8976 9.273 20.9455C9.37996 21 9.51997 21 9.8 21L20.2 21Z" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 5.8C9 5.51997 9 5.37996 9.0545 5.273C9.10243 5.17892 9.17892 5.10243 9.273 5.0545C9.37996 5 9.51997 5 9.8 5H12.2C12.48 5 12.62 5 12.727 5.0545C12.8211 5.10243 12.8976 5.17892 12.9455 5.273C13 5.37996 13 5.51997 13 5.8V8.2C13 8.48003 13 8.62004 12.9455 8.727C12.8976 8.82108 12.8211 8.89757 12.727 8.9455C12.62 9 12.48 9 12.2 9H9.8C9.51997 9 9.37996 9 9.273 8.9455C9.17892 8.89757 9.10243 8.82108 9.0545 8.727C9 8.62004 9 8.48003 9 8.2V5.8Z" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 11.8C2 11.52 2 11.38 2.0545 11.273C2.10243 11.1789 2.17892 11.1024 2.273 11.0545C2.37996 11 2.51997 11 2.8 11H5.2C5.48003 11 5.62004 11 5.727 11.0545C5.82108 11.1024 5.89757 11.1789 5.9455 11.273C6 11.38 6 11.52 6 11.8V14.2C6 14.48 6 14.62 5.9455 14.727C5.89757 14.8211 5.82108 14.8976 5.727 14.9455C5.62004 15 5.48003 15 5.2 15H2.8C2.51997 15 2.37996 15 2.273 14.9455C2.17892 14.8976 2.10243 14.8211 2.0545 14.727C2 14.62 2 14.48 2 14.2V11.8Z" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 1.8C1 1.51997 1 1.37996 1.0545 1.273C1.10243 1.17892 1.17892 1.10243 1.273 1.0545C1.37996 1 1.51997 1 1.8 1H4.2C4.48003 1 4.62004 1 4.727 1.0545C4.82108 1.10243 4.89757 1.17892 4.9455 1.273C5 1.37996 5 1.51997 5 1.8V4.2C5 4.48003 5 4.62004 4.9455 4.727C4.89757 4.82108 4.82108 4.89757 4.727 4.9455C4.62004 5 4.48003 5 4.2 5H1.8C1.51997 5 1.37996 5 1.273 4.9455C1.17892 4.89757 1.10243 4.82108 1.0545 4.727C1 4.62004 1 4.48003 1 4.2V1.8Z" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        // <IntegrationsIcon></IntegrationsIcon>
      ),
      'run-history': (
        <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.7 11.5L18.7005 9.5L16.7 11.5M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C13.3019 1 16.1885 2.77814 17.7545 5.42909M10 5V10L13 12" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        // <RunHistoryIcon></RunHistoryIcon>
      )
    };

  return (
    // <Router>
    <div className="app-container">
    
    {isLoggedIn() && (
      <HeaderAndSidebar />
    )}
    
    {!isLoggedIn() ? (
      <AppRoutes></AppRoutes>
    ) : (
      <div className={`menu-container ${isSidebarOpened? 'ml-[15rem]':'ml-[4rem]'}`}>
        {/* <Drawer
          variant="permanent"
          open={isSidebarOpen}
          className={isSidebarOpen ? "menuhandle" : ""}
        >
          <List>
            {navItems.map((item) => (
              (!item.permissions || checkPerms(item.permissions)) && (
                <ListItem
                  key={item.text}
                  component="a"
                  href={item.route}
                  className={window.location.pathname.startsWith(item.route) ? "active-list-item" : ""}
                >
                  <ListItemIcon className="menu-text">
                    <div className={`pointer myIcon ${window.location.pathname.startsWith(item.route) ? "active" : ""}`}>
                      {icons[item.icon]}
                    </div>
                  </ListItemIcon>
                  {isSidebarOpen && (
                    <ListItemText 
                      primary={item.text} 
                      className="menu-name" 
                    />
                  )}
                </ListItem>
              )
            ))}
          </List>
        </Drawer> */}
        
        <main className={`content ${!isSidebarOpened ? "drawerWidth" : ""}`}>
          {isLoading && (
            <div className="data-load-backdrop-wrapper">
              <div className="data-load-backdrop"></div>
              <div className="data-loader">
                <div className="spinner"></div>
              </div>
            </div>
          )}
          
          <AppRoutes></AppRoutes>
        </main>
      </div>
    )}
  </div>
    // </Router>
  );
};

export default AppLayout;