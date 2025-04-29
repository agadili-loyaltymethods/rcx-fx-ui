import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const useDeactivate = (component: CanComponentDeactivate) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBeforeUnload = useCallback(async (e: BeforeUnloadEvent) => {
    const finalUrl = location.pathname;
    
    if (finalUrl === '/login' || finalUrl === '/logout') {
      return true;
    }

    const state = location.state as { disableDeactivateGuard?: boolean };
    if (state?.disableDeactivateGuard) {
      return true;
    }

    const canLeave = await component.canDeactivate();
    if (!canLeave) {
      e.preventDefault();
      e.returnValue = '';
    }
    return canLeave;
  }, [component, location]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    history.pushState(null, '', location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload, location.href]);
};