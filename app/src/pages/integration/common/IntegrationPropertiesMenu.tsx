import React from 'react';
import { Button } from '@mui/material';
import { useAlert } from '@/services/alert/useAlert';

interface IntegrationPropertiesMenuProps {
  onMenuClick: (value: string) => void;
  properties: any;
  isvalidForm: boolean;
  isView?: boolean;
  validateForm?: () => void;
  activeMenuProperties?: string;
}

const IntegrationPropertiesMenu: React.FC<IntegrationPropertiesMenuProps> = ({
  onMenuClick,
  properties,
  isvalidForm,
  isView = false,
  validateForm,
  activeMenuProperties = 'integration_properties'
}) => {
  const { infoAlert } = useAlert();

  const handleMenuClick = (value: string) => {
    if (!isView && !isvalidForm) {
      if (validateForm) {
        validateForm();
      }
      infoAlert('Please fill all required fields.', '');
      return;
    }
    onMenuClick(value);
  };

  return (
    <>
      <div className="integration-button-left-container bg-gray-50 border-b border-gray-300">
        <Button
          className={`btn-properties w-[86%] border border-gray-300 text-gray-700 text-left py-3 px-3.5 rounded m-4 bg-white ${
            activeMenuProperties === 'integration_properties' ? 'button-active border-blue-400 text-blue-700' : ''
          }`}
          onClick={() => handleMenuClick('integration_properties')}
        >
          <span className="material-icons text-sm mr-1">description</span>
          <span className="label-child">Integration Properties</span>
        </Button>
      </div>
      
      <div className="integration-button-left-container list-btn-counter my-3">
        <Button
          className={`btn-properties btn-margin w-[86%] border border-gray-300 text-gray-700 text-left py-3 px-3.5 rounded mx-4 my-1 bg-white ${
            activeMenuProperties === 'input_properties' ? 'button-active border-blue-400 text-blue-700' : ''
          }`}
          onClick={() => handleMenuClick('input_properties')}
          disabled={!properties.partner}
        >
          <span className="material-icons text-sm mr-1">arrow_forward</span>
          <span className="label-child">Input Properties</span>
        </Button>
        
        <Button
          className={`btn-properties btn-margin w-[86%] border border-gray-300 text-gray-700 text-left py-3 px-3.5 rounded mx-4 my-1 bg-white ${
            activeMenuProperties === 'response_properties' ? 'button-active border-blue-400 text-blue-700' : ''
          }`}
          onClick={() => handleMenuClick('response_properties')}
          disabled={!properties.partner}
        >
          <span className="material-icons text-sm mr-1">arrow_back</span>
          <span className="label-child">Response Properties</span>
        </Button>
        
        <Button
          className={`btn-properties btn-margin w-[86%] border border-gray-300 text-gray-700 text-left py-3 px-3.5 rounded mx-4 my-1 bg-white ${
            activeMenuProperties === 'integration_parameters' ? 'button-active border-blue-400 text-blue-700' : ''
          }`}
          onClick={() => handleMenuClick('integration_parameters')}
        >
          <span className="material-icons text-sm mr-1">settings</span>
          <span className="label-child">Integration Parameters</span>
        </Button>
        
        <Button
          className={`btn-properties btn-margin w-[86%] border border-gray-300 text-gray-700 text-left py-3 px-3.5 rounded mx-4 my-1 bg-white ${
            activeMenuProperties === 'scheduling_properties' ? 'button-active border-blue-400 text-blue-700' : ''
          }`}
          onClick={() => handleMenuClick('scheduling_properties')}
        >
          <span className="material-icons text-sm mr-1">schedule</span>
          <span className="label-child">Scheduling</span>
        </Button>
        
        <Button
          className={`btn-properties btn-margin w-[86%] border border-gray-300 text-gray-700 text-left py-3 px-3.5 rounded mx-4 my-1 bg-white ${
            activeMenuProperties === 'alerts_properties' ? 'button-active border-blue-400 text-blue-700' : ''
          }`}
          onClick={() => handleMenuClick('alerts_properties')}
        >
          <span className="material-icons text-sm mr-1">notifications</span>
          <span className="label-child">Alerts</span>
        </Button>
        
        <Button
          className={`btn-properties btn-margin w-[86%] border border-gray-300 text-gray-700 text-left py-3 px-3.5 rounded mx-4 my-1 bg-white ${
            activeMenuProperties === 'dependencies_properties' ? 'button-active border-blue-400 text-blue-700' : ''
          }`}
          onClick={() => handleMenuClick('dependencies_properties')}
        >
          <span className="material-icons text-sm mr-1">device_hub</span>
          <span className="label-child">Dependencies</span>
        </Button>
        
        <Button
          className={`btn-properties btn-margin w-[86%] border border-gray-300 text-gray-700 text-left py-3 px-3.5 rounded mx-4 my-1 bg-white ${
            activeMenuProperties === 'error_code_mapping_properties' ? 'button-active border-blue-400 text-blue-700' : ''
          }`}
          onClick={() => handleMenuClick('error_code_mapping_properties')}
        >
          <span className="material-icons text-sm mr-1">error_outline</span>
          <span className="label-child">Error Code Mapping</span>
        </Button>
      </div>
    </>
  );
};

export default IntegrationPropertiesMenu;