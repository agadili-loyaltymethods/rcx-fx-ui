import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { useAuthContext } from '../context/AuthContext';
import { useUtils } from '@/services/utils/useUtils';
import { useAuthContext } from '@/AppConfig';

export const useRouteGuard = () => {
  const { isLoggedIn, pathPermissionMap } = useAuthContext();
  const { isAllowed, checkEdit } = useUtils();
  const navigate = useNavigate();
  const location = useLocation();

  const checkAccess = useCallback(async () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return false;
    }

    const hasUIPerm = await isAllowed({ FX_UI: ['read'] });
    if (!hasUIPerm) {
      navigate('/login');
      return false;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    let path = pathSegments[0];
    let parentPath = pathSegments[0];

    if (parentPath === 'run-history') {
      parentPath = 'runhistory';
      path = 'list';
    }

    const id = pathSegments[2];
    if (path === 'edit') {
      return checkEdit(parentPath, id);
    }

    const permCheck = pathPermissionMap[parentPath.toLowerCase()]?.[path];
    if (permCheck) {
      const allowed = await isAllowed(permCheck);
      if (!allowed && location.pathname === '/') {
        navigate('/dashboard');
      }
      return allowed;
    }

    return false;
  }, [isLoggedIn, isAllowed, checkEdit, navigate, location, pathPermissionMap]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess, location]);

  return { checkAccess };
};