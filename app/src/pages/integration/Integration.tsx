import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  ToggleButtonGroup, 
  ToggleButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DropDownWithSearch } from '@/components/common';
import IntegrationList from './IntegrationList';
import IntegrationGrid from './IntegrationGrid';
import { useUtils } from '@/services/utils/useUtils';
import { useIntegrations } from '@/services/integrations/useIntegrations';
import { useAlert } from '@/services/alert/useAlert';
import { useDialog } from '@/components/Dialog/useDialog';

const Integration: React.FC = () => {
  const navigate = useNavigate();
  const { checkPerms, onChange, resetFilters, filterListData } = useUtils();
  const { getIntegrations } = useIntegrations();
  const { successAlert, errorAlert } = useAlert();
  const { open } = useDialog();
  
  const [showListView, setShowListView] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [dataCollection, setDataCollection] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [cfgOpt, setCfgOpt] = useState<any>({});
  const [searchValue, setSearchValue] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [partnerNameOptions, setPartnerNameOptions] = useState<any[]>([]);
  const [integrationNameOptions, setIntegrationNameOptions] = useState<any[]>([]);
  const [templateNameOptions, setTemplateNameOptions] = useState<any[]>([]);
  const [connectionNameOptions, setConnectionNameOptions] = useState<any[]>([]);
  const [rcxProcessOptions, setRcxProcessOptions] = useState<any[]>([]);
  const [rcxStatusOptions, setRcxStatusOptions] = useState<any[]>([]);
  
  const pageName = 'integrations';

  useEffect(() => {
    // Initialize config
    const initConfig = async () => {
      // In a real implementation, this would fetch from a config service
      const config = {
        data: [
          { name: 'name', label: 'Integration Name', type: 'text', routerLink: '/integrations/detail' },
          { name: 'partner.name', label: 'Partner', type: 'text' },
          { name: 'template.name', label: 'Template', type: 'text' },
          { name: 'template.rcxProcess', label: 'RCX Process', type: 'text' },
          { name: 'status', label: 'Status', type: 'text' },
          { name: 'updatedBy.login', label: 'Last Updated By', type: 'text' },
          { name: 'updatedAt', label: 'Last Updated', type: 'date', pipe: 'dateTimeFormat' },
          { name: 'actions', label: 'Actions', type: 'actions' }
        ],
        actions: [
          { name: 'Edit', iconname: 'edit', clickHandler: 'editIntegration' },
          { name: 'Copy', iconname: 'content_copy', clickHandler: 'copyIntegration' },
          { name: 'Run Once', iconname: 'play_arrow', clickHandler: 'runOnceIntegration' },
          { name: 'Publish', iconname: 'publish', clickHandler: 'publishIntegration' },
          { name: 'Unpublish', iconname: 'unpublished', clickHandler: 'unpublishIntegration' },
          { name: 'Pause', iconname: 'pause', clickHandler: 'pauseIntegration' },
          { name: 'Resume', iconname: 'play_arrow', clickHandler: 'resumeIntegration' },
          { name: 'Delete', iconname: 'delete', clickHandler: 'deleteIntegration' }
        ],
        filterOptions: {
          partner: {
            placeholder: 'Partner',
            searchplaceholder: 'Search Partner',
            label: 'Partner',
            field: 'partner'
          },
          template: {
            placeholder: 'Template',
            searchplaceholder: 'Search Template',
            label: 'Template',
            field: 'template'
          },
          rcxProcess: {
            placeholder: 'RCX Process',
            searchplaceholder: 'Search RCX Process',
            label: 'RCX Process',
            field: 'rcxProcess'
          },
          status: {
            placeholder: 'Status',
            searchplaceholder: 'Search Status',
            label: 'Status',
            field: 'status'
          }
        },
        filters: {}
      };
      
      setConfig(config);
      setCfgOpt(config.filterOptions);
      setRefresh(config?.refresh ?? false);
      
      // Set view preference from localStorage
      const savedView = localStorage.getItem('integrationListView');
      setShowListView(savedView === null ? true : savedView === 'true');
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
      const rcxProcessData = [
        { label: 'Process 1', value: 'process1' },
        { label: 'Process 2', value: 'process2' }
      ];
      
      const statusData = [
        { label: 'Published', value: 'Published' },
        { label: 'Revision', value: 'Revision' },
        { label: 'Paused', value: 'Paused' }
      ];
      
      setRcxProcessOptions(rcxProcessData.map(p => ({ name: p.label, id: p.value })));
      setRcxStatusOptions(statusData.map(s => ({ name: s.label, id: s.value })));
      
      config['RCX Process'] = rcxProcessOptions;
      config['Status'] = rcxStatusOptions;
      
      // This would fetch partners from an API
      const partners = [
        { name: 'Partner 1', id: '1' },
        { name: 'Partner 2', id: '2' }
      ];
      
      setPartnerNameOptions(partners);
      config['Partner'] = partners;
      
      // This would fetch templates from an API
      const templates = [
        { name: 'Template 1', id: '1' },
        { name: 'Template 2', id: '2' }
      ];
      
      setTemplateNameOptions(templates);
      config['Template'] = templates;
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const getListData = async () => {
    try {
      // This would fetch integrations from an API
      // For now, we'll just set some dummy data
      const integrationsData = [
        { 
          _id: '1', 
          name: 'Integration 1', 
          partner: { name: 'Partner 1', _id: '1' },
          template: { name: 'Template 1', _id: '1', rcxProcess: 'Process 1' },
          status: 'Published',
          description: 'This is a description for Integration 1',
          updatedBy: { login: 'user1', _id: 'u1' },
          updatedAt: new Date().toISOString()
        },
        { 
          _id: '2', 
          name: 'Integration 2', 
          partner: { name: 'Partner 2', _id: '2' },
          template: { name: 'Template 2', _id: '2', rcxProcess: 'Process 2' },
          status: 'Revision',
          description: 'This is a description for Integration 2',
          updatedBy: { login: 'user2', _id: 'u2' },
          updatedAt: new Date().toISOString()
        }
      ];
      
      setData(integrationsData);
      setDataCollection(integrationsData);
      
      // Update integration name options
      const integrationNames = integrationsData.map(i => ({ name: i.name, id: i._id }));
      setIntegrationNameOptions(integrationNames);
      config['Integration'] = integrationNames;
      
      // Apply any existing filters
      filterListData({ 
        data: integrationsData, 
        dataCollection: integrationsData, 
        config, 
        pageName 
      });
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const viewGrid = () => {
    localStorage.setItem('integrationListView', 'false');
    setShowListView(false);
  };

  const viewList = () => {
    localStorage.setItem('integrationListView', 'true');
    setShowListView(true);
  };

  const createIntegration = () => {
    navigate('/integrations/create');
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

  // Handler functions for the integration list/grid
  const getDataHandler = {
    copyIntegration: (row: any) => {
      open({
        schema: 'Integration',
        getInput: true,
        inputType: 'text',
        header: 'Please enter the Integration Name',
        onConfirm: async (name: string) => {
          try {
            // This would copy the integration via API
            // For now, just show a success message
            successAlert('Integration copied successfully');
            getListData();
          } catch (err: any) {
            errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
          }
        }
      });
    },
    runOnceIntegration: (row: any) => {
      open({
        schema: 'Confirm Action',
        content: 'Are you sure you want to run integration once?',
        confirmButton: 'Yes',
        cancelButton: 'No',
        onConfirm: async () => {
          try {
            // This would run the integration once via API
            // For now, just show a success message
            successAlert(`Integration ${row.name} has been submitted for immediate execution. Please check run history for details`);
          } catch (err: any) {
            errorAlert(err.errorMessage || 'Cannot run integration');
          }
        }
      });
    },
    editIntegration: (row: any) => {
      row.status = 'Revision';
      navigate(`/integrations/edit/${row._id}`, { state: { properties: row } });
    },
    deleteIntegration: (row: any) => {
      open({
        schema: 'Delete Integrations',
        content: `Are you sure that you want to delete <strong>${row.name || ''}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        onConfirm: async () => {
          try {
            // This would delete the integration via API
            // For now, just show a success message
            successAlert('Integration deleted successfully');
            getListData();
          } catch (err: any) {
            errorAlert(err.errorMessage || 'Cannot delete integration');
          }
        }
      });
    },
    resumeIntegration: (row: any) => {
      open({
        schema: 'Confirm Action',
        content: 'Are you sure you want to resume integration?',
        confirmButton: 'Yes',
        cancelButton: 'No',
        onConfirm: async () => {
          try {
            // This would resume the integration via API
            // For now, just show a success message
            successAlert('Integration resumed successfully');
            getListData();
          } catch (err: any) {
            errorAlert(err.errorMessage || 'Cannot resume integration');
          }
        }
      });
    },
    pauseIntegration: (row: any) => {
      open({
        schema: 'Confirm Action',
        content: 'Are you sure you want to pause integration?',
        confirmButton: 'Yes',
        cancelButton: 'No',
        onConfirm: async () => {
          try {
            // This would pause the integration via API
            // For now, just show a success message
            successAlert('Integration paused successfully');
            getListData();
          } catch (err: any) {
            errorAlert(err.errorMessage || 'Cannot pause integration');
          }
        }
      });
    },
    publishIntegration: (row: any) => {
      open({
        schema: 'Confirm Action',
        content: 'Are you sure you want to publish integration?',
        confirmButton: 'Yes',
        cancelButton: 'No',
        onConfirm: async () => {
          try {
            // This would publish the integration via API
            // For now, just show a success message
            successAlert('Integration published successfully');
            getListData();
          } catch (err: any) {
            errorAlert(err.errorMessage || 'Cannot publish integration');
          }
        }
      });
    },
    unpublishIntegration: (row: any) => {
      open({
        schema: 'Unpublish Integration - Preserve Run History',
        content: 'Unpublishing will deallocate all backend resources associated with the integration and move it to Revision status.<br>Would you like to keep Run History?',
        getInput: true,
        inputType: 'switch',
        header: 'Unpublish Integration - Preserve Run History',
        textBlock: 'Unpublishing will deallocate all backend resources associated with the integration and move it to Revision status.<br>Would you like to keep Run History?',
        content: [
          { key: 'Discard Run History', value: true },
          { key: 'Keep Run History', value: false }
        ],
        onConfirm: async (data: any, inputData: any, isToggleActive: boolean) => {
          try {
            // This would unpublish the integration via API
            // For now, just show a success message
            successAlert('Integration unpublished successfully');
            getListData();
          } catch (err: any) {
            errorAlert(err.errorMessage || 'Cannot unpublish integration');
          }
        }
      });
    }
  };

  // Helper function to maintain original order
  const originalOrder = () => 0;

  return (
    <div className="integration">
      <Card className="shadow-none border-b border-gray-200">
        <CardContent className="flex justify-between items-center p-7">
          <Typography variant="h5" className="font-semibold text-gray-900">
            Integrations
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createIntegration}
            disabled={!checkPerms({ FX_Integration: ['create'] })}
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
            <div className="p-5 flex justify-between items-center">
              <div className="flex-grow"></div>
              <div className="flex items-center">
                <TextField
                  placeholder="Search by Integration Name or Description"
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
                  className="w-96 mr-4"
                />
                
                <ToggleButtonGroup
                  value={showListView ? 'list' : 'grid'}
                  exclusive
                  aria-label="view mode"
                >
                  <ToggleButton 
                    value="list" 
                    onClick={viewList}
                    className={`border border-gray-300 ${showListView ? 'bg-blue-50 border-blue-300' : ''}`}
                  >
                    <ViewListIcon />
                  </ToggleButton>
                  <ToggleButton 
                    value="grid" 
                    onClick={viewGrid}
                    className={`border border-gray-300 ${!showListView ? 'bg-blue-50 border-blue-300' : ''}`}
                  >
                    <ViewModuleIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
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
            
            {/* Panel Section */}
            <div className="p-5">
              {showListView ? (
                <IntegrationList
                  data={data}
                  config={config}
                  handler={getDataHandler}
                />
              ) : (
                <IntegrationGrid
                  data={data}
                  handler={getDataHandler}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integration;