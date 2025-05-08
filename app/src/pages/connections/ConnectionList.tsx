import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@mui/material';
import { MdAdd, MdSearch, MdRefresh } from 'react-icons/md';
import { useUtils } from '@/hooks/useUtils';
import { useConnections } from '@/hooks/useConnections';
import { useAlert } from '@/hooks/useAlert';
import { useDialog } from '@/hooks/useDialog';
import { sharedConstants } from '@/constants/shared-constants';
import DynamicTable from '@/components/common/DynamicTable/DynamicTable';
import DropDownWithSearch from '@/components/common/DropDownWithSearch/DropDownWithSearch';
import ConfirmationDialog from '@/components/common/ConfirmationDialog/ConfirmationDialog';

interface Options {
  id: string;
  name: string;
}

interface ConnectionsListProps {
  isReadOnly?: boolean;
  onSelectionChange?: (selected: any[]) => void;
  onDataLoaded?: (data: any[]) => void;
  defaultFilters?: Record<string, any>;
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({
  isReadOnly = false,
  onSelectionChange,
  onDataLoaded,
  defaultFilters = {}
}) => {
  // State variables
  const [data, setData] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [cfgOpt, setCfgOpt] = useState<any>({});
  const [dataCollection, setDataCollection] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [requiredData, setRequiredData] = useState<any>({ selectedData: [] });
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<any>(null);

  // Dropdown options
  const [partnerNameOptions, setPartnerNameOptions] = useState<Options[]>([]);
  const [connectionTypeOptions, setConnectionTypeOptions] = useState<Options[]>([]);
  const [connectionNameOptions, setConnectionNameOptions] = useState<Options[]>([]);
  const [lastUpdatedByOptions, setLastUpdatedByOptions] = useState<Options[]>([]);
  const connectionTestOptions: Options[] = [
    { id: '1', name: 'Valid' },
    { id: '2', name: 'Invalid' }
  ];

  // Hooks
  const navigate = useNavigate();
  const { checkPerms, filterListData } = useUtils();
  const { getConnections, deleteConnections, connectionsValidate } = useConnections();
  const { successAlert, errorAlert } = useAlert();
  const { open } = useDialog();

  // Constants
  const pageName = 'connections';

  // Initialize component
  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      setLoading(true);
      // Load configuration
      const connectionsConfig = await fetchListViewConfig('connections') || {};
      
      // Set config
      const fullConfig = {
        ...connectionsConfig,
        filters: { ...defaultFilters }
      };
      
      setConfig(fullConfig);
      setCfgOpt(connectionsConfig.filterOptions || {});
      setRefresh(connectionsConfig?.refresh ?? false);
      
      // Get data
      await getData();
      
    } catch (error) {
      console.error('Failed to initialize ConnectionsList', error);
      errorAlert('Failed to initialize connections list');
    } finally {
      setLoading(false);
    }
  };

  // Mock function for getting list view config - replace with your actual service
  const fetchListViewConfig = async (entity: string) => {
    // This would be replaced with your actual API call
    return {
      data: [
        { name: 'name', label: 'Connection Name', type: 'text', routerLink: '/connections/detail' },
        { name: 'partner.name', label: 'Partner', type: 'text' },
        { name: 'connectionType', label: 'Connection Type', type: 'text' },
        { name: 'tested', label: 'Test Status', type: 'boolean' },
        { name: 'encAndComp', label: 'Encryption/Compression', type: 'text' },
        { name: 'updatedBy.login', label: 'Last Updated By', type: 'text' },
        { name: 'updatedAt', label: 'Last Updated', type: 'date', pipe: 'dateTimeFormat' },
        { name: 'actions', label: 'Actions', type: 'actions' }
      ],
      actions: [
        { name: 'Edit', iconname: 'edit', clickHandler: 'edit' },
        { name: 'Test', iconname: 'check_circle', clickHandler: 'test' },
        { name: 'Delete', iconname: 'delete', clickHandler: 'delete', 
          dispCondField: 'isSystemUser', dispCondValue: false }
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
      refresh: true
    };
  };

  // Selection change handler
  useEffect(() => {
    if (onSelectionChange && requiredData.selectedData) {
      onSelectionChange(requiredData.selectedData);
    }
  }, [requiredData.selectedData, onSelectionChange]);

  // Data fetching methods
  const getData = async () => {
    try {
      await getFilterData();
      await getListData();
    } catch (error) {
      console.error('Error getting data', error);
    }
  };

  const getRefreshData = async () => {
    try {
      setLoading(true);
      await getListData();
    } finally {
      setLoading(false);
    }
  };

  const getFilterData = async () => {
    try {
      // Get enum options (connection types)
      const enums = await fetchEnums();
      getDropDownEnums(enums);
      
      // Get partners
      const partners = await fetchPartners();
      getPartnerNameOptions(partners);
      
      // Set test options
      const updatedConfig = { ...config };
      updatedConfig['Connection Test Status'] = connectionTestOptions;
      setConfig(updatedConfig);
      
    } catch (err: any) {
      errorAlert(err.errorMessage || sharedConstants.defaultErrorMessage);
    }
  };

  // Mock functions for fetching data - replace with actual API calls
  const fetchEnums = async () => {
    return [
      { _id: 's3', value: 'S3' },
      { _id: 'sftp', value: 'SFTP' }
    ];
  };

  const fetchPartners = async () => {
    return [
      { _id: '1', name: 'Partner 1' },
      { _id: '2', name: 'Partner 2' }
    ];
  };

  const getListData = async () => {
    try {
      // Get user and partner info
      const userDetail = await fetchUserDetails();
      const partner = userDetail?.partner || '';
      
      const partnerQuery: any = {
        populate: JSON.stringify([
          { path: 'partner', select: 'name' },
          { path: 'updatedBy', select: 'login' },
        ]),
      };
      
      if (partner) {
        partnerQuery.query = JSON.stringify({ partner });
      }
      
      // Get connections data
      const s3Data = await getConnections('s3', partnerQuery);
      const sftpData = await getConnections('sftp', partnerQuery);
      
      const combinedData = [...s3Data, ...sftpData];
      
      // Process data for display
      combinedData.forEach((connection) => {
        connection.encAndComp =
          (connection.encryptionEnabled ? 'Y' : 'N') +
          '/' +
          (connection.compressionEnabled ? 'Y' : 'N');
      });
      
      setData(combinedData);
      setDataCollection(combinedData);
      
      // Notify parent about loaded data
      if (onDataLoaded) {
        onDataLoaded(combinedData);
      }
      
      getConnectionNameOptions(combinedData);
      getUpdatedByOptions(combinedData);
      
      applyFilters(combinedData);
      
    } catch (err: any) {
      errorAlert(err.errorMessage || sharedConstants.defaultErrorMessage);
    }
  };

  // Mock function for user details - replace with actual service call
  const fetchUserDetails = async () => {
    return {
      name: 'Test User',
      email: 'test@example.com',
      partner: ''
    };
  };

  // Apply current filters to data
  const applyFilters = (connections: any[]) => {
    filterListData({
      data: connections,
      dataCollection: connections,
      config,
      searchValue,
      pageName
    });
  };

  // Options processing methods
  const getPartnerNameOptions = (partners: any[]) => {
    const options = partners.map((p) => ({ name: p.name, id: p._id }));
    setPartnerNameOptions(options);
    
    const updatedConfig = { ...config };
    updatedConfig['Partner'] = options;
    setConfig(updatedConfig);
  };

  const getDropDownEnums = (enums: any[]) => {
    const options = enums.map((e) => ({ name: e.value, id: e._id }));
    setConnectionTypeOptions(options);
    
    const updatedConfig = { ...config };
    updatedConfig['Connection Type'] = options;
    setConfig(updatedConfig);
  };

  const getUpdatedByOptions = (data: any[]) => {
    const options: Options[] = [];
    
    for (const item of data) {
      const updatedByArray = options.map((obj) => obj.name);
      const uniqueUpdatedBySet = new Set(updatedByArray);
      const uniqueUpdatedByArray = Array.from(uniqueUpdatedBySet);
      
      if (item.updatedBy?.login && !uniqueUpdatedByArray.includes(item.updatedBy?.login)) {
        options.push({
          name: item.updatedBy?.login,
          id: item.updatedBy?._id,
        });
      }
    }
    
    setLastUpdatedByOptions(options);
    
    const updatedConfig = { ...config };
    updatedConfig['Last Updated By'] = options;
    setConfig(updatedConfig);
  };

  const getConnectionNameOptions = (data: any[]) => {
    const options: Options[] = [];
    
    for (const item of data) {
      const connectionNameArray = options.map((obj) => obj.name);
      const connectionNameSet = new Set(connectionNameArray);
      const uniqueConnectionNameArray = Array.from(connectionNameSet);
      
      if (item.name && !uniqueConnectionNameArray.includes(item.name)) {
        options.push({
          name: item.name,
          id: item._id,
        });
      }
    }
    
    setConnectionNameOptions(options);
    
    const updatedConfig = { ...config };
    updatedConfig['Connection Name'] = options;
    setConfig(updatedConfig);
  };

  // Action handlers
  const editHandler = (row: any) => {
    navigate(`/connections/edit/${row._id}`, { state: row });
  };

  const deleteHandler = (row: any) => {
    setDialogData({
      data: row,
      schema: 'Delete Connection',
      content: `Are you sure that you want to delete <strong>${row.name}</strong>?`,
      confirmButton: 'Yes, Delete',
      cancelButton: 'No',
    });
    setDialogOpen(true);
  };

  const confirmationDialog = async (row: any) => {
    try {
      await deleteConnections(row);
      successAlert('Connection deleted successfully');
      await getListData();
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Cannot delete connection');
    } finally {
      setDialogOpen(false);
    }
  };

  const testHandler = async (row: any) => {
    try {
      let dataCopy: any = JSON.stringify(row);
      const formData = new FormData();
      formData.append('data', dataCopy);
      
      let data = await connectionsValidate(formData);
      
      if (data) {
        open({
          type: 'successDialog',
          schema: 'Connection Established',
          message: 'Test Successful',
          disableCancelButton: true,
          confirmButton: 'Ok',
        });
      }
    } catch (err: any) {
      let error: any = '';
      const errorMessage = err.errorMessage || sharedConstants.defaultErrorMessage;
      
      if (err.errorCode === 1508) {
        const errKeys = Object.keys(err.errors || {});
        error = errKeys.map((key) => ({
          key: key,
          value: err.errors[key]
        }));
      }
      
      open({
        schema: 'Connection Failed',
        disableCancelButton: true,
        confirmButton: 'Ok',
        content: error || errorMessage,
        type: error ? 'errorDialog' : undefined
      });
    }
    
    await getListData();
  };

  // Event handlers
  const createConnection = () => {
    navigate('/connections/create');
  };

  const handleChange = (options: any) => {
    const updatedConfig = { ...config };
    
    if (options.input !== undefined) {
      setSearchValue(options.input);
    }
    
    if (options.field && options.value !== undefined) {
      if (!updatedConfig.filters) {
        updatedConfig.filters = {};
      }
      
      if (options.value.length > 0) {
        updatedConfig.filters[options.field] = options.value;
      } else {
        delete updatedConfig.filters[options.field];
      }
      
      setConfig(updatedConfig);
    }
    
    filterListData({
      data,
      dataCollection,
      config: updatedConfig,
      searchValue: options.input !== undefined ? options.input : searchValue,
      pageName
    });
  };

  const resetFilters = () => {
    const updatedConfig = { ...config };
    updatedConfig.filters = {};
    setConfig(updatedConfig);
    setSearchValue('');
    
    filterListData({
      data: dataCollection,
      dataCollection,
      config: updatedConfig,
      searchValue: '',
      pageName
    });
  };

  const getSelectedValue = (list: any[] = [], fieldName: string) => {
    const filters = config.filters?.[fieldName] || [];
    return list.filter((l: any) => filters.includes(l.name));
  };

  // Data handlers
  const handlers = {
    delete: deleteHandler,
    edit: editHandler,
    test: testHandler
  };

  // Helper function
  const originalOrder = () => 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!isReadOnly && (
        <div className="bg-white border-b border-gray-200 shadow-none">
          <div className="flex justify-between items-center py-7">
            <h1 className="text-2xl font-semibold text-gray-900 px-6">
              Connections
            </h1>
            
            <div className="px-6">
              {checkPerms({FX_Connection: ['create']}) && (
                <button
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={createConnection}
                >
                  <MdAdd className="mr-2" size={20} />
                  Create New
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`bg-gray-50 ${isReadOnly ? 'p-0' : 'p-8'} flex-1`}>
        <div className="bg-white border border-gray-200 shadow-none">
          {/* Search Section */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <div className="flex w-full justify-end">
              <div className="relative max-w-[370px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="text-gray-400" size={20} />
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by Connection Name or Description"
                  value={searchValue}
                  onChange={(e) => handleChange({ input: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          {/* Filters Section */}
          <div className="p-5 border-t border-b border-gray-200 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-[0.9]">
              {Object.entries(cfgOpt).map(([key, item]: [string, any]) => (
                <div key={key} className="w-[20%] mr-[15px]" style={{ marginBottom: '8px' }}>
                  <DropDownWithSearch
                    placeHolder={item.placeholder}
                    placeHolderSearch={item.searchplaceholder}
                    label={item.label}
                    multiple={true}
                    selectBoxOptions={config[item.label] || []}
                    selectedValue={getSelectedValue(config[item.label], item.field)}
                    fieldName={item.field}
                    valueChange={(event) => handleChange({ ...event, field: item.field })}
                    className={item.label === 'Connection Test Status' ? 'small-dropdown' : ''}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex-shrink-0 ml-auto flex items-center space-x-2">
              {refresh && (
                <button 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={getRefreshData}
                >
                  <MdRefresh className="text-gray-600" size={18} />
                </button>
              )}
              
              <button 
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <DynamicTable
              data={data}
              config={config}
              handlers={handlers}
              requiredData={requiredData}
              showPagination={true}
              isView={isReadOnly}
              parentData={dataCollection}
            />
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {dialogData && (
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <ConfirmationDialog
            data={dialogData}
            onConfirm={() => confirmationDialog(dialogData.data)}
            onCancel={() => setDialogOpen(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default ConnectionsList;