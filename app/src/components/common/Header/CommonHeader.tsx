import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/services/auth/useAuth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileImgText, setProfileImgText] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loggedAs, setLoggedAs] = useState('');

  useEffect(() => {
    // Get user info from session storage
    const isOkta = sessionStorage.getItem('oktaEnabled') || 'false';
    let orgNameValue: string;
    let loggedAsValue: string;

    if (isOkta === 'true') {
      orgNameValue = sessionStorage.getItem('org') || '';
      loggedAsValue = sessionStorage.getItem('RCX_username') || '';
    } else {
      const user = sessionStorage.getItem('user')
        ? sessionStorage.getItem('user')?.split('/')
        : [];
      orgNameValue = user?.[0] || '';
      loggedAsValue = user?.[1] || '';
    }

    const profileText = orgNameValue.charAt(0).toUpperCase() + loggedAsValue.charAt(0).toUpperCase();
    
    setOrgName(orgNameValue);
    setLoggedAs(loggedAsValue);
    setProfileImgText(profileText);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser();
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/user-profile');
    handleMenuClose();
  };

  return (
    <AppBar position="static" color="default" elevation={1} className="bg-white">
      <Toolbar className="px-7 py-4">
        <div className="flex items-center cursor-pointer ml-auto">
          <button 
            onClick={handleMenuOpen}
            className="flex items-center text-left"
          >
            <Avatar className="bg-gray-100 text-gray-800 mr-2">
              {profileImgText}
            </Avatar>
            <div>
              <Typography variant="body1" className="font-medium text-gray-900">
                {orgName}
              </Typography>
              <Typography variant="body2" className="text-gray-700">
                {loggedAs}
              </Typography>
            </div>
            <KeyboardArrowDownIcon className="ml-2 text-gray-500" />
          </button>
          
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
          >
            <MenuItem onClick={handleProfile} className="py-2 px-4">
              <PersonIcon className="mr-2" fontSize="small" />
              My Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} className="py-2 px-4">
              <LogoutIcon className="mr-2" fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;