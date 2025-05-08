import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@mui/material';
import { MdAdd, MdSearch, MdRefresh } from 'react-icons/md';
import { useUtils } from '../../services/utils/useUtils';
import { useConnections } from '../../services/connections/useConnections';
import { usePartners } from '../../services/partners/usePartners';
import { usePrograms } from '../../services/programs/usePrograms';
import { useAuth } from '../../services/auth/useAuth';
import { useAlert } from '../../services/alert/useAlert';
import { useDialog } from '@/components/Dialog/useDialog';
import { firstValueFrom } from 'rxjs';
import DynamicTable from '@/components/common/DynamicTable/DynamicTable';
import DropDownWithSearch from '@/components/common/DropDownWithSearch/DropDownWithSearch';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import ConfirmationDialog from '@/components/common/ConfirmationDialog/ConfirmationDialog';
import { sharedConstants } from '@/constants/shared-constants';

interface Options {
  id: string;
  name: string;
}

const ConnectionsTable: React.FC = () => {
  // State variables
  const [data, setData] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [cfgOpt, setCfgOpt] = useState<any>({});
  const [dataCollection, setDataCollection] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [inputFieldValue, setInputFieldValue] = useState<any[]>([]);
  const [requiredData, setRequiredData] = useState<any>({ selectedData: [] });
  const [refresh, setRefresh] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<any>(null);

  // Dropdown options
  const [partnerNameOptions, setPartnerNameOptions] = useState<Options[]>([]);
  const [connectionTypeOptions, setConnectionTypeOptions] = useState<Options[]>([]);
  const [connectionNameOptions, setConnectionNameOptions] = useState<Options[]>([]);
  const [lastUpdatedByOptions, setLastUpdatedByOptions] = useState<Options[]>([]);
  const [connectionTestOptions] = useState<Options[]>([
    { id: '1', name: 'Valid' },
    { id: '2', name: 'Invalid' }
  ]);

  // Hooks
  const navigate = useNavigate();
  const { checkPerms, filterListData } = useUtils();
  const { getConnections, deleteConnections, connectionsValidate } = useConnections();
  const { getPartners } = usePartners();
  const { getEnums } = usePrograms();
  const { getUser } = useAuth();
  const { successAlert, errorAlert } = useAlert();
  const { getListViewConfig } = useUiConfig();
  const { open } = useDialog();

  // Constants
  const pageName = 'connections';

  // Data handlers
  const getDataHandlers = {
    delete: (row: any) => deleteHandler(row),
    edit: (row: any) => editHandler(row),
    test: (row: any) => testHandler(row)
  };

  // Initialize component
  useEffect(() => {
    const initComponent = async () => {
      try {
        // Get config
        const connectionsConfig = await getListViewConfig('connections') || {};
        let integrationsConfig = await getListViewConfig('integrations') || {};
        
        // Process integrations config
        integrationsConfig.data = (integrationsConfig.data || []).filter((i: any) => {
          if (i.modifySource) {
            i.source = 'connections';
          }
          if (!i?.displayPages) {
            return true;
          } else {
            return i.displayPages.includes("connections");
          }
        });
        
        // Set config
        const fullConfig = {
          ...connectionsConfig,
          integrations: integrationsConfig,
          filters: {}
        };
        
        setConfig(fullConfig);
        setCfgOpt(connectionsConfig.filterOptions || {});
        setRefresh(connectionsConfig?.refresh ?? false);
        
        // Get data
        await getData();
        setRequiredData({ selectedData: selectedData || [] });
      } catch (error) {
        console.error('Failed to initialize ConnectionsTable', error);
        errorAlert('Failed to initialize connections table');
      }
    };

    initComponent();
  }, []);

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
    await getListData();
  };

  const getFilterData = async () => {
    try {
      // Get connection types from enums
      const enumsQuery = {
        query: JSON.stringify({
          type: 'ConnectionType',
          lang: 'en',
        }),
        select: 'label,value',
      };
      
      const configCopy = { ...config };
      configCopy['Connection Test Status'] = connectionTestOptions;
      
      const enums = await getEnums(enumsQuery);
      getDropDownEnums(enums);
      
      // Get partners
      const partners = await getPartners({});
      getPartnerNameOptions(partners);
      
      setConfig(configCopy);
    } catch (err: any) {
      errorAlert(err.errorMessage || sharedConstants.defaultErrorMessage);
    }
  };

  const getListData = async () => {
    try {
      const userDetail = await getUser();
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
      
      getConnectionNameOptions(combinedData);
      getUpdatedByOptions(combinedData);
      
      filterListData({
        data: combinedData,
        dataCollection: combinedData,
        config,
        searchValue,
        inputFieldValue,
        pageName
      });
    } catch (err: any) {
      errorAlert(err.errorMessage || sharedConstants.defaultErrorMessage);
    }
  };

  // Options processing methods
  const getPartnerNameOptions = (partners: any[]) => {
    const options = partners.map((p) => ({ name: p.name, id: p._id }));
    setPartnerNameOptions(options);
    
    const configCopy = { ...config };
    configCopy['Partner'] = options;
    setConfig(configCopy);
  };

  const getDropDownEnums = (enums: any[]) => {
    const options = enums.map((e)=> ({ name: e.value, id: e._id }));
    setConnectionTypeOptions(options);
    
    const configCopy = { ...config };
    configCopy['Connection Type'] = options;
    setConfig(configCopy);
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
    
    const configCopy = { ...config };
    configCopy['Last Updated By'] = options;
    setConfig(configCopy);
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
    
    const configCopy = { ...config };
    configCopy['Connection Name'] = options;
    setConfig(configCopy);
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
      getListData();
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Cannot delete connection');
    }
    setDialogOpen(false);
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

  // UI event handlers
  const createConnection = () => {
    navigate('/connections/create');
  };

  const handleChange = (options: any) => {
    const newConfig = { ...config };
    
    if (options.input !== undefined) {
      setSearchValue(options.input);
    }
    
    if (options.field && options.value) {
      if (!newConfig.filters[options.field]) {
        newConfig.filters[options.field] = [];
      }
      
      if (options.value.length > 0) {
        newConfig.filters[options.field] = options.value;
      } else {
        delete newConfig.filters[options.field];
      }
      
      setConfig(newConfig);
    }
    
    filterListData({
      data,
      dataCollection,
      config: newConfig,
      searchValue: options.input !== undefined ? options.input : searchValue,
      inputFieldValue,
      pageName
    });
  };

  const resetFilters = () => {
    const newConfig = { ...config };
    newConfig.filters = {};
    setConfig(newConfig);
    setSearchValue('');
    
    filterListData({
      data: dataCollection,
      dataCollection,
      config: newConfig,
      searchValue: '',
      inputFieldValue: [],
      pageName
    });
  };

  const getSelectedValue = (list: any[] = [], fieldName: string) => {
    const filters = config.filters?.[fieldName] || [];
    return list.filter((l: any) => filters.includes(l.name));
  };

  // Helper function to maintain original order
  const originalOrder = () => 0;

  return (
    <div>
      {/* Header */}
      <div className="shadow-none border-b border-gray-200">
        <div className="flex justify-between">
          <h1 className="float-left text-2xl font-semibold py-7 px-6 text-gray-900">
            Connections
          </h1>
          
          {checkPerms({FX_Connection: ['create']}) && (
            <div className="float-right p-6">
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={createConnection}
              >
                <MdAdd className="mr-2" />
                Create New
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-8 bg-gray-50">
        <div className="shadow-none border border-gray-200">
          {/* Search Bar */}
          <div className="p-4 flex items-center justify-between">
            <div className="right-elements flex w-full justify-end">
              <div className="relative max-w-[370px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="text-gray-400" />
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
          
          {/* Filters */}
          <div className="clear-both p-5 border-t border-b border-gray-200 flex flex-row items-center justify-between">
            <div className="filter-options flex-[0.9]">
              {Object.entries(cfgOpt).map(([key, item]: [string, any]) => (
                <DropDownWithSearch
                  key={key}
                  placeHolder={item.placeholder}
                  placeHolderSearch={item.searchplaceholder}
                  label={item.label}
                  multiple={true}
                  selectBoxOptions={config[item.label] || []}
                  selectedValue={getSelectedValue(config[item.label], item.field)}
                  fieldName={item.field}
                  valueChange={(event) => handleChange(event)}
                  className="w-1/5 mr-4 inline-block"
                />
              ))}
            </div>
            
            <div className="filter-reset">
              {refresh && (
                <button 
                  className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={getRefreshData}
                >
                  <MdRefresh className="refresh-icon" />
                </button>
              )}
              
              <button 
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Table */}
          <DynamicTable
            data={data}
            config={config}
            handlers={getDataHandlers}
            requiredData={requiredData}
            showPagination={true}
            isView={false}
          />
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

export default ConnectionsTable;