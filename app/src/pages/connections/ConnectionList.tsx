import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import { DynamicTable } from '../../components/common';
import { useUtils } from '../../services/utils/useUtils';
import { useConnectionUtils } from '../../services/connection-utils/useConnectionUtils';
import { useDialog } from '../../services/dialog/useDialog';
import { useAlert } from '../../services/alert/useAlert';

interface ConnectionListProps {
  config: any;
  data: any[];
  handler: any;
  requiredData?: any;
}

const ConnectionList: React.FC<ConnectionListProps> = ({
  config,
  data = [],
  handler,
  requiredData = {}
}) => {
  const [childData, setChildData] = useState<any[]>([]);
  const navigate = useNavigate();
  const { checkPerms } = useUtils();
  const { edit, deleteConnection } = useConnectionUtils();
  const { openDialog } = useDialog();
  const { successAlert, errorAlert } = useAlert();

  useEffect(() => {
    if (data && data.length && data[0]._id) {
      // Sort data by creation date (newest first)
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      if (requiredData) {
        requiredData.selectedRow = sortedData[0];
      }
      
      populateIntegrations();
    }
  }, [data]);

  const resetSelection = (newData: any[]) => {
    if (requiredData) {
      requiredData.selectedRow = (newData && newData[0]) || {};
    }
  };

  const editHandler = (row: any) => {
    edit(row);
  };

  const deleteHandler = (row: any) => {
    deleteConnection(row);
  };

  const testHandler = (row: any) => {
    handler.test(row);
  };

  const populateIntegrations = async () => {
    if (!checkPerms({ FX_Integration: ['read'] })) {
      return;
    }
    
    if (
      data && 
      data.length && 
      requiredData && 
      requiredData.selectedRow && 
      requiredData.selectedRow._id
    ) {
      try {
        // This would fetch integrations based on the selected connection
        // For now, we'll just set some dummy data
        const integrations = [
          { _id: '1', name: 'Integration 1', status: 'Published' },
          { _id: '2', name: 'Integration 2', status: 'Revision' }
        ];
        
        setChildData(integrations);
      } catch (err: any) {
        errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
      }
    } else {
      setChildData([]);
    }
  };

  const createUser = () => {
    navigate('/users/create', { state: { partner: requiredData.selectedRow } });
  };

  const handlers = {
    edit: editHandler,
    delete: deleteHandler,
    test: testHandler,
    populateIntegrations,
    resetSelection,
    // Additional handlers for integrations
    editUser: (row: any) => navigate(`/users/edit/${row._id}`, { state: row }),
    deleteUser: (row: any) => {
      openDialog({
        schema: 'Delete User',
        content: `Are you sure that you want to delete <strong>${row.login}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        onConfirm: () => {
          // This would delete the user
          successAlert('User deleted successfully');
          populateIntegrations();
        }
      });
    },
    getUsers: async () => {
      if (!checkPerms({ User: ['read'] })) {
        return;
      }
      
      if (requiredData?.selectedRow?._id) {
        try {
          // This would fetch users based on the selected connection
          // For now, we'll just set some dummy data
          const users = [
            { _id: '1', login: 'user1', email: 'user1@example.com' },
            { _id: '2', login: 'user2', email: 'user2@example.com' }
          ];
          
          setChildData(users);
        } catch (err: any) {
          errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
        }
      } else {
        setChildData([]);
      }
    }
  };

  // Child config for users table
  const childConfig = {
    data: [
      { name: 'login', label: 'Username', type: 'text', routerLink: '/users/detail' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'updatedBy.login', label: 'Last Updated By', type: 'text' },
      { name: 'updatedAt', label: 'Last Updated', type: 'date', pipe: 'dateTimeFormat' },
      { name: 'actions', label: 'Actions', type: 'actions' }
    ],
    actions: [
      { name: 'Edit', iconname: 'edit', clickHandler: 'editUser' },
      { name: 'Delete', iconname: 'delete', clickHandler: 'deleteUser' }
    ]
  };

  return (
    <div className="responsive-table">
      <DynamicTable
        config={config}
        data={data}
        requiredData={requiredData}
        handlers={handlers}
      />
      
      {checkPerms({ 'User': ['read'] }) && (
        <div>
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center p-7">
              <Typography variant="h5" className="font-semibold text-gray-900">
                Partner Admins
              </Typography>
              
              {checkPerms({ 'User': ['create'] }) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={createUser}
                  className="ml-auto bg-blue-800 hover:bg-blue-900"
                >
                  Create Partner Admins
                </Button>
              )}
            </div>
          </div>
          
          <DynamicTable
            config={childConfig}
            data={childData}
            handlers={handlers}
          />
        </div>
      )}
    </div>
  );
};

export default ConnectionList;