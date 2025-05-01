import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-5 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;