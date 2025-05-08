import React, { useState } from 'react';
import { 
  Button, 
  Typography, 
  IconButton, 
  Card, 
  CardContent 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';
import { DeleteButton } from '@/components/common';
import IntegrationPropertiesMenu from './common/IntegrationPropertiesMenu';
import FormHeader from './common/FormHeader';

const ViewIntegration: React.FC = () => {
  const [showProperties, setShowProperties] = useState('integration_properties');

  const onMenuClick = (value: string) => {
    setShowProperties(value);
  };

  // Mock data for demonstration
  const headerData = {
    headerName: 'Integration',
    status: 'Published',
    lastUpdateBy: 'John Doe',
    date: '09 Apr 2023',
    time: '8:15 am',
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-7 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-4">
            <IconButton 
              component={Link} 
              to="/integrations/list"
              className="border border-gray-200 rounded-full"
            >
              <ArrowBackIcon />
            </IconButton>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-700">
              Integration / <span className="text-gray-500">Integration Details</span>
            </Typography>
            <Typography variant="h6" className="font-semibold">
              Integration 123
            </Typography>
          </div>
        </div>
        
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          component={Link}
          to="/integrations/edit/123"
          className="bg-blue-800 hover:bg-blue-900"
        >
          Edit
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        <div className="childContainer">
          <FormHeader headerData={headerData} />
          
          <div className="main-container bottom-radius-none flex border border-gray-200 rounded-b-lg">
            <div className="left-panel integrate-left-panel w-64 border-r-0 bg-white">
              <IntegrationPropertiesMenu
                onMenuClick={onMenuClick}
                properties={{}}
                isvalidForm={true}
                isView={true}
              />
            </div>
            
            <div className="right-panel integrate-right-panel w-[calc(100%-16rem)] bg-white">
              <div className="form">
                <div className="right-panel-header border-b border-gray-200 py-4 px-8">
                  <div className="right-panel-left-content">
                    <div className="bread-crum text-base font-semibold text-gray-900">
                      Input File / Body / <span className="text-gray-500">1</span>
                    </div>
                    <div className="bread-crum-child text-xs text-gray-500">
                      Sequence #1
                    </div>
                  </div>
                </div>
                
                <div className="right-panel-main-content p-4">
                  <div className="flex">
                    <div className="w-1/2">
                      <div className="p-5">
                        <div className="mb-1 text-sm font-medium text-gray-600">
                          Name
                        </div>
                        <div className="text-base font-medium text-gray-900">
                          Hertz
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-1/2">
                      <div className="p-5">
                        <div className="mb-1 text-sm font-medium text-gray-600">
                          RCX Process
                        </div>
                        <div className="text-base font-medium text-gray-900">
                          Enrollment
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-1/2">
                      <div className="p-5">
                        <div className="mb-1 text-sm font-medium text-gray-600">
                          Partner
                        </div>
                        <div className="text-base font-medium text-gray-900">
                          This is my template name here
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-1/2">
                      <div className="p-5">
                        <div className="mb-1 text-sm font-medium text-gray-600">
                          Description
                        </div>
                        <div className="text-base font-medium text-gray-900">
                          This is description here
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Delete Button */}
          <div className="mt-4">
            <DeleteButton>Delete Integration</DeleteButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewIntegration;