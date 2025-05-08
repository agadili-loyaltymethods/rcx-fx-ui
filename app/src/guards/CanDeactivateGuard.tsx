import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
import { useDeactivate } from '../hooks/useDeactivate';

interface CanDeactivateProps {
  component: React.ReactElement;
}

export const CanDeactivateGuard: React.FC<CanDeactivateProps> = ({ component }) => {
  // const location = useLocation();
  // const navigate = useNavigate();
  
  // Clone the component and add the canDeactivate method
  const componentWithGuard = React.cloneElement(component, {
    canDeactivate: async () => {
      // This would be implemented in each component that needs the guard
      // Default implementation allows navigation
      if (component.props.canDeactivate) {
        return await component.props.canDeactivate();
      }
      return true;
    }
  });
  
  // Use the custom hook to handle the deactivation logic
  useDeactivate(componentWithGuard.props);
  
  return componentWithGuard;
};
