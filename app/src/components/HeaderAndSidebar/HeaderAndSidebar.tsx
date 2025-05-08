import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import { useUtils } from '../../services/utils/useUtils';
import { useDispatch } from 'react-redux';
import { setSideBar } from '@/redux/slices/authSlice';

const HeaderAndSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const { setSidebarState } = useUtils();
  const dispatch = useDispatch();
  
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    setSidebarState(newState);
    dispatch(setSideBar({isSideBarOpened: newState}));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`
          flex-1 overflow-auto bg-gray-50 p-6
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'ml-0 md:ml-60' : 'ml-0 md:ml-16'}
        `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HeaderAndSidebar;