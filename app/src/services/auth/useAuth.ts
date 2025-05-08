import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoginModel } from '@/models/login-model';
import { getAppConfig } from '../configService';
import axiosInstance from '../http/axiosInstance';
import { setAuthenticated } from '@/redux/slices/authSlice';
import { useDispatch } from 'react-redux';
// import { API_CONFIG } from '../../config/api.config';
// import { LoginModel } from '../../models/login.model';

interface UserPermissions {
  [key: string]: {
    [key: string]: boolean;
  };
}

interface AuthState {
  user: any;
  permissions: UserPermissions;
  oktaEnabled: string;
  orgName: string;
  serverInfo: any;
}

export const pathPermissionMap = {
  integrations: {
    list: { FX_Integration: ['read'] },
    create: { FX_Integration: ['create'] },
    edit: { FX_Integration: ['update'] },
    detail: { FX_Integration: ['read'] },
  },
  connections: {
    list: { FX_Connection: ['read'] },
    create: { FX_Connection: ['create'] },
    edit: { FX_Connection: ['update'] },
    detail: { FX_Connection: ['read'] },
  },
  templates: {
    list: { FX_IntegrationTemplate: ['read'] },
    create: { FX_IntegrationTemplate: ['create'] },
    edit: { FX_IntegrationTemplate: ['update'] },
    detail: { FX_IntegrationTemplate: ['read'] },
  },
  partners: {
    list: { FX_Partner: ['read'] },
    create: { FX_Partner: ['create'] },
    edit: { FX_Partner: ['update'] },
    detail: { FX_Partner: ['read'] },
  },
  runhistory: {
    list: { FX_RunHistory: ['read'] },
  },
  users: {
    create: { User: ['create'] },
    edit: { User: ['update'] },
    detail: { User: ['read'] },
  },
};

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [state, setState] = useState<AuthState>({
    user: {},
    permissions: {},
    oktaEnabled: 'false',
    orgName: '',
    serverInfo: undefined,
  });
  const { config } = getAppConfig();

  const getToken = useCallback(() => {
    return sessionStorage.getItem('token');
  }, []);

  const loginUser = useCallback(async (user: LoginModel) => {
    const response: any = await axiosInstance.post<LoginModel>(`${config.REST_URL}/login`, user);
    localStorage.setItem('token',response.data?.token);
    dispatch(setAuthenticated({token: response.data?.token}));
    return response.data;
  }, []);

  const fetchUserPermissions = useCallback(async () => {
    try {
      const response: any = await axiosInstance.get(`${config.RC_REST_URL}acl/permissions`);
      const permissions = response.data?.permissions || {};
      setState(prev => ({ ...prev, permissions }));
      return permissions;
    } catch (err: any) {
      if (err?.response?.data?.errorCode === 1104) {
        logoutUser();
      }
      throw err;
    }
  }, []);

  const setUser = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${config.RC_REST_URL}myaccount`);
      const user: any = response.data || {};
      const userDetails = {
        login: user.login,
        email: user.email,
      };
      user.userProfile = userDetails;
      setState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  }, []);

  const getUser = useCallback(async (field?: string) => {
    if (!Object.keys(state.user).length) {
      await setUser();
    }
    return field ? state.user[field] : state.user;
  }, [state.user, setUser]);

  const isLoggedIn = useCallback(() => {
    const loggedIn = !!sessionStorage.getItem('token');
    const orgName = sessionStorage.getItem('org') || '';
    const oktaEnabled = sessionStorage.getItem('oktaEnabled') || '';

    if (loggedIn) {
      if (state.oktaEnabled !== oktaEnabled || state.orgName !== orgName) {
        setState(prev => ({ ...prev, oktaEnabled, orgName }));
      }
    }
    return loggedIn;
  }, [state.oktaEnabled, state.orgName]);

  const goToLogin = useCallback((response: any) => {
    if (response && response.postLogoutRedirect) {
      navigate('/logout');
    } else {
      if (sessionStorage.oktaEnabled) {
        window.location.replace('/int-login');
      } else {
        navigate('/login');
      }
    }
  }, [navigate]);

  const logoutUser = useCallback(async () => {
    if (!isLoggedIn()) {
      sessionStorage.removeItem('token');
      goToLogin({});
      return;
    }

    setState(prev => ({ ...prev, user: undefined }));

    if (sessionStorage.getItem('oktaEnabled') === 'true') {
      sessionStorage.removeItem('RCX_username');
      sessionStorage.removeItem('org');
      sessionStorage.removeItem('userLimits');
      sessionStorage.removeItem('idtoken');
    } else {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('org');
    }

    try {
      const response = await axios.get(`${config.RC_REST_URL}logout`);
      sessionStorage.removeItem('token');
      goToLogin(response.data);
    } catch (error) {
      sessionStorage.removeItem('token');
      goToLogin({});
    }
  }, [isLoggedIn, goToLogin]);

  const fetchServerInfo = useCallback(async () => {
    const response = await axiosInstance.get(`${config.REST_URL}/serverinfo`);
    const serverInfo = response.data;
    setState(prev => ({ ...prev, serverInfo }));
    return serverInfo;
  }, []);

  const getServerInfo = useCallback(async () => {
    if (!state.serverInfo) {
      await fetchServerInfo();
    }
    return state.serverInfo;
  }, [state.serverInfo, fetchServerInfo]);

  const resetPassword = useCallback(async (params: any) => {
    const response = await axiosInstance.post(`${config.REST_URL}/reset-password?client=fxui`, params);
    return response.data;
  }, []);

  const sendUserId = useCallback(async (params: any) => {
    const response = await axiosInstance.post(`${config.REST_URL}/send-userid?locale=en`, params);
    return response.data;
  }, []);

  useEffect(() => {
    if (isLoggedIn()) {
      fetchUserPermissions();
    }
  }, [isLoggedIn, fetchUserPermissions]);

  return {
    user: state.user,
    permissions: state.permissions,
    oktaEnabled: state.oktaEnabled,
    orgName: state.orgName,
    serverInfo: state.serverInfo,
    loginUser,
    logoutUser,
    isLoggedIn,
    getToken,
    getUser,
    fetchUserPermissions,
    getServerInfo,
    resetPassword,
    sendUserId,
    pathPermissionMap,
  };
};