import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  CardContent,
  TextField,
  InputAdornment,
  Drawer
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { DropDownWithSearch } from '../../components/common';
import ConnectionList from './ConnectionList';
import { useUtils } from '../../services/utils/useUtils';
import { useConnections } from '../../services/connections/useConnections';
import { useAlert } from '../../services/alert/useAlert';
import { useDialog } from '../../services/dialog/useDialog';

const ConnectionsTable: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [cfgOpt, setCfgOpt] = useState<any>({});
  const [dataCollection, setDataCollection] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [requiredData, setRequiredData] = useState<any>({});
  const [partnerNameOptions, setPartnerNameOptions] = useState<any[]>([]);
  const [connectionTypeOptions, setConnectionTypeOptions] = useState<any[]>([]);
  const [connectionNameOptions, setConnectionNameOptions] = useState<any[]>([]);
  const [lastUpdatedByOptions, setLastUpdatedByOptions] = useState<any[]>([]);
  const [connectionTestOptions] = useState<any[]>([
    { id: '1', name: 'Valid' },
    { id: '2', name: 'Invalid' }
  ]);
  
  const navigate = useNavigate();
  const { checkPerms, onChange, resetFilters, filterListData } = useUtils();
  const { getConnections, connectionsValidate } = useConnections();
  const { successAlert, errorAlert } = useAlert();
  const { openDialog } = useDialog();
  
  const pageName = 'connections';

  useEffect(() => {
    // Initialize config
    const initConfig = async () => {
      // In a real implementation, this would fetch from a config service
      setConfig({
        data: [
          {
            name: 'name',
            label: 'Connection Name',
            type: 'text',
            routerLink: '/connections/detail'
          },
          {
            name: 'partner.name',
            label: 'Partner',
            type: 'text'
          },
          {
            name: 'connectionType',
            label: 'Connection Type',
            type: 'text'
          },
          {
            name: 'tested',
            label: 'Test Status',
            type: 'boolean'
          },
          {
            name: 'encAndComp',
            label: 'Encryption/Compression',
            type: 'text'
          },
          {
            name: 'updatedBy.login',
            label: 'Last Updated By',
            type: 'text'
          },
          {
            name: 'updatedAt',
            label: 'Last Updated',
            type: 'date',
            pipe: 'dateTimeFormat'
          },
          {
            name: 'actions',
            label: 'Actions',
            type: 'actions'
          }
        ],
        actions: [
          {
            name: 'Edit',
            iconname: 'edit',
            clickHandler: 'edit'
          },
          {
            name: 'Test',
            iconname: 'check_circle',
            clickHandler: 'test'
          },
          {
            name: 'Delete',
            iconname: 'delete',
            clickHandler: 'delete'
          }
        ],
        filterOptions: {
          partner: {
            placeholder: 'Partner',
            searchplaceholder: 'Search Partner',
            label: 'Partner',
            field: 'partner'
          },
          connectionType: {
            placeholder: 'Connection Type',
            searchplaceholder: 'Search Connection Type',
            label: 'Connection Type',
            field: 'connectionType'
          },
          connectionName: {
            placeholder: 'Connection Name',
            searchplaceholder: 'Search Connection Name',
            label: 'Connection Name',
            field: 'name'
          },
          connectionTest: {
            placeholder: 'Connection Test Status',
            searchplaceholder: 'Search Connection Test Status',
            label: 'Connection Test Status',
            field: 'tested'
          },
          lastUpdatedBy: {
            placeholder: 'Last Updated By',
            searchplaceholder: 'Search Last Updated By',
            label: 'Last Updated By',
            field: 'updatedBy'
          }
        },
        filters: {}
      });
      
      setCfgOpt({
        partner: {
          placeholder: 'Partner',
          searchplaceholder: 'Search Partner',
          label: 'Partner',
          field: 'partner'
        },
        connectionType: {
          placeholder: 'Connection Type',
          searchplaceholder: 'Search Connection Type',
          label: 'Connection Type',
          field: 'connectionType'
        },
        connectionName: {
          placeholder: 'Connection Name',
          searchplaceholder: 'Search Connection Name',
          label: 'Connection Name',
          field: 'name'
        },
        connectionTest: {
          placeholder: 'Connection Test Status',
          searchplaceholder: 'Search Connection Test Status',
          label: 'Connection Test Status',
          field: 'tested'
        },
        lastUpdatedBy: {
          placeholder: 'Last Updated By',
          searchplaceholder: 'Search Last Updated By',
          label: 'Last Updated By',
          field: 'updatedBy'
        }
      });
      
      setRefresh(true);
    };
    
    initConfig();
    getData();
  }, []);

  const getData = async () => {
    await getFilterData();
    await getListData();
  };

  const getRefreshData = async () => {
    await getListData();
  };

  const getFilterData = async () => {
    try {
      // This would fetch enum data from an API
      // For now, we'll just set some dummy data
      const connectionTypes = [
        { name: 'S3', id: 's3' },
        { name: 'SFTP', id: 'sftp' }
      ];
      
      setConnectionTypeOptions(connectionTypes);
      config['Connection Type'] = connectionTypes;
      config['Connection Test Status'] = connectionTestOptions;
      
      // This would fetch partners from an API
      const partners = [
        { name: 'Partner 1', id: '1' },
        { name: 'Partner 2', id: '2' }
      ];
      
      setPartnerNameOptions(partners.map(p => ({ name: p.name, id: p.id })));
      config['Partner'] = partnerNameOptions;
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const getListData = async () => {
    try {
      // This would fetch connections from an API
      // For now, we'll just set some dummy data
      const s3Data = [
        { 
          _id: '1', 
          name: 'S3 Connection 1', 
          connectionType: 'S3',
          partner: { name: 'Partner 1', _id: '1' },
          tested: true,
          encryptionEnabled: true,
          compressionEnabled: false,
          updatedBy: { login: 'user1', _id: 'u1' },
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      
      const sftpData = [
        { 
          _id: '2', 
          name: 'SFTP Connection 1', 
          connectionType: 'SFTP',
          partner: { name: 'Partner 2', _id: '2' },
          tested: false,
          encryptionEnabled: false,
          compressionEnabled: true,
          updatedBy: { login: 'user2', _id: 'u2' },
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      
      const combinedData = [...s3Data, ...sftpData];
      
      // Add encryption/compression status
      combinedData.forEach(connection => {
        connection.encAndComp = 
          (connection.encryptionEnabled ? 'Y' : 'N') + 
          '/' + 
          (connection.compressionEnabled ? 'Y' : 'N');
      });
      
      setData(combinedData);
      setDataCollection(combinedData);
      
      getConnectionNameOptions(combinedData);
      getUpdatedByOptions(combinedData);
      
      // Apply any existing filters
      filterListData({ 
        data: combinedData, 
        dataCollection: combinedData, 
        config, 
        pageName 
      });
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const getConnectionNameOptions = (connections: any[]) => {
    const options: any[] = [];
    
    for (const connection of connections) {
      const connectionNames = options.map(opt => opt.name);
      const uniqueNames = new Set(connectionNames);
      
      if (!uniqueNames.has(connection.name)) {
        options.push({
          name: connection.name,
          id: connection._id
        });
      }
    }
    
    setConnectionNameOptions(options);
    config['Connection Name'] = options;
  };

  const getUpdatedByOptions = (connections: any[]) => {
    const options: any[] = [];
    
    for (const connection of connections) {
      const updatedByNames = options.map(opt => opt.name);
      const uniqueNames = new Set(updatedByNames);
      
      if (connection.updatedBy?.login && !uniqueNames.has(connection.updatedBy.login)) {
        options.push({
          name: connection.updatedBy.login,
          id: connection.updatedBy._id
        });
      }
    }
    
    setLastUpdatedByOptions(options);
    config['Last Updated By'] = options;
  };

  const createConnection = () => {
    navigate('/connections/create');
  };

  const handleChange = (options: any) => {
    onChange({
      config,
      data,
      dataCollection,
      searchValue,
      pageName
    }, options);
  };

  const handleResetFilters = () => {
    resetFilters({
      searchValue: '',
      inputFieldValue: [],
      config,
      data: dataCollection,
      pageName
    });
    
    setSearchValue('');
  };

  const getSelectedValue = (list: any[] = [], fieldName: string) => {
    const filters = config.filters?.[fieldName] || [];
    return list.filter((l: any) => filters.includes(l.name));
  };

  const getDataHandler = {
    delete: (row: any) => {
      openDialog({
        schema: 'Delete Connection',
        content: `Are you sure that you want to delete <strong>${row.name}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        onConfirm: async () => {
          try {
            // This would delete the connection
            // await deleteConnections(row);
            successAlert('Connection deleted successfully');
            getListData();
          } catch (err: any) {
            errorAlert(err.errorMessage || 'Cannot delete connection');
          }
        }
      });
    },
    edit: (row: any) => {
      navigate(`/connections/edit/${row._id}`, { state: row });
    },
    test: async (row: any) => {
      try {
        const formData = new FormData();
        formData.append('data', JSON.stringify(row));
        
        const data = await connectionsValidate(formData);
        
        if (data) {
          openDialog({
            schema: 'Connection Established',
            message: 'Test Successful',
            disableCancelButton: true,
            confirmButton: 'Ok',
            type: 'successDialog'
          });
        }
      } catch (err: any) {
        let error: any = '';
        const errorMessage = err.errorMessage || 'Something went wrong. Please try again later.';
        
        if (err.errorCode === 1508) {
          const errKeys = Object.keys(err.errors || {});
          error = errKeys.map(key => ({
            key,
            value: err.errors[key]
          }));
        }
        
        openDialog({
          schema: 'Connection Failed',
          disableCancelButton: true,
          confirmButton: 'Ok',
          content: error || errorMessage,
          type: error ? 'errorDialog' : undefined
        });
      }
      
      await getListData();
    }
  };

  // Helper function to maintain original order
  const originalOrder = () => 0;

  return (
    <div>
      <Card className="shadow-none border-b border-gray-200">
        <CardContent className="flex justify-between items-center p-7">
          <Typography variant="h5" className="font-semibold text-gray-900">
            Connections
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createConnection}
            disabled={!checkPerms({ FX_Connection: ['create'] })}
            className="bg-blue-800 hover:bg-blue-900"
          >
            Create New
          </Button>
        </CardContent>
      </Card>
      
      <div className="p-8 bg-gray-50">
        <Card className="shadow-none border border-gray-200">
          <CardContent className="p-0">
            {/* Search Section */}
            <div className="p-5 flex justify-end">
              <TextField
                placeholder="Search by Connection Name or Description"
                variant="outlined"
                size="small"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  handleChange({ input: e.target.value });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                className="w-96"
              />
            </div>
            
            {/* Filter Section */}
            <div className="p-5 border-t border-b border-gray-200 flex justify-between items-center">
              <div className="flex flex-wrap gap-4 flex-grow">
                {Object.entries(cfgOpt).map(([key, value]: [string, any]) => (
                  <DropDownWithSearch
                    key={key}
                    placeHolder={value.placeholder}
                    placeHolderSearchBox={value.searchplaceholder}
                    label={value.label}
                    multiple={true}
                    selectBoxOptions={config[value.label] || []}
                    selectedValue={getSelectedValue(config[value.label], value.field)}
                    fieldName={value.field}
                    valueChange={(options) => handleChange(options)}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                {refresh && (
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={getRefreshData}
                  >
                    Refresh
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
            
            {/* Connection List */}
            <ConnectionList
              data={data}
              config={config}
              handler={getDataHandler}
              requiredData={requiredData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionsTable;