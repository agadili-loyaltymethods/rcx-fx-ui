import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, IconButton } from '@mui/material';
import './Header.css';
import { useAuth } from '../../hooks/useAuth';
import { useUtils } from '../../services/utils/useUtils';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileData, setProfileData] = useState({
    orgName: '',
    loggedAs: '',
    profileImgText: ''
  });
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const { getUserName, getSidebarState, setSidebarState } = useUtils();

  useEffect(() => {
    // Get user profile information
    const result = getUserName(sessionStorage.getItem('oktaEnabled') || 'false');
    if (result && Object.keys(result).length) {
      setProfileData({
        orgName: result.orgName,
        loggedAs: result.loggedAs,
        profileImgText: result.profileImgText
      });
    }
  }, [getUserName]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    if (!getSidebarState()) {
      toggleSidebar();
      setSidebarState(true);
    }
    logoutUser();
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/user-profile');
  };

  return (
    <div className="toolbar">
      <IconButton onClick={() => {toggleSidebar()}} className="pointer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </IconButton>
      <img src="/assets/logo.svg" className="logo" alt="ReactorCX Logo" />
      <div className="flexExpand"></div>
      
      <div className="profile-wrap" onClick={handleMenuOpen}>
        <span className="profile-img-text">{profileData.profileImgText}</span>
        <div className="profile-name">
          {profileData.orgName}
          <br />
          <span className="profile-order">{profileData.loggedAs}</span>
        </div>
        <svg className="icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10.5L3 5.5L13 5.5L8 10.5Z" fill="#667085"/>
        </svg>
      </div>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className="profile-menu"
      >
        <MenuItem onClick={handleProfileClick} className="profile-menu-list">
          <svg className="icon" width="20" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.00002 20.8174C3.6026 21 4.41649 21 5.8 21H16.2C17.5835 21 18.3974 21 19 20.8174M3.00002 20.8174C2.87082 20.7783 2.75133 20.7308 2.63803 20.673C2.07354 20.3854 1.6146 19.9265 1.32698 19.362C1 18.7202 1 17.8802 1 16.2V5.8C1 4.11984 1 3.27976 1.32698 2.63803C1.6146 2.07354 2.07354 1.6146 2.63803 1.32698C3.27976 1 4.11984 1 5.8 1H16.2C17.8802 1 18.7202 1 19.362 1.32698C19.9265 1.6146 20.3854 2.07354 20.673 2.63803C21 3.27976 21 4.11984 21 5.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C19.2487 20.7308 19.1292 20.7783 19 20.8174M3.00002 20.8174C3.00035 20.0081 3.00521 19.5799 3.07686 19.2196C3.39249 17.6329 4.63288 16.3925 6.21964 16.0769C6.60603 16 7.07069 16 8 16H14C14.9293 16 15.394 16 15.7804 16.0769C17.3671 16.3925 18.6075 17.6329 18.9231 19.2196C18.9948 19.5799 18.9996 20.0081 19 20.8174M15 8.5C15 10.7091 13.2091 12.5 11 12.5C8.79086 12.5 7 10.7091 7 8.5C7 6.29086 8.79086 4.5 11 4.5C13.2091 4.5 15 6.29086 15 8.5Z" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          My Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} className="profile-menu-list">
          <svg className="icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 15L19 10M19 10L14 5M19 10H7M7 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19H7" stroke="#1D2939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Header;