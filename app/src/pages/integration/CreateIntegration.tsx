import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  IconButton, 
  Drawer, 
  Box 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import { DeleteButton, ErrorSidePanel } from '@/components/common';
import { useAlert } from '@/services/alert/useAlert';
import { useUtils } from '@/services/utils/useUtils';
import { useIntegrations } from '@/services/integrations/useIntegrations';
import { format } from 'date-fns';

// Import common components
import IntegrationPropertiesMenu from './common/IntegrationPropertiesMenu';
import IntegrationProperties from './common/IntegrationProperties';
import AlertsProperties from './common/AlertsProperties';
import IntegrationParameters from './common/IntegrationParameters';
import SchedulingProperties from './common/SchedulingProperties';
import ResponseProperties from './common/ResponseProperties';
import DependenciesProperties from './common/DependenciesProperties';
import ErrorCodeMappingProperties from './common/ErrorCodeMappingProperties';
import InputProperties from './common/InputProperties';
import { useDialog } from '@/components/Dialog/useDialog';

// Integration model (simplified)
interface Integration {
  _id?: string;
  name: string;
  description?: string;
  status: string;
  partner: string | any;
  template: string;
  inputProperties: any;
  responseProperties: any;
  scheduling: any;
  alerts: any[];
  dependencies: any[];
  errorCodeMapping: any[];
  parameters: any[];
  updatedBy?: any;
  updatedAt?: string;
}

const CreateIntegration: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  
  const [showProperties, setShowProperties] = useState('integration_properties');
  const [properties, setProperties] = useState<Integration>({
    name: '',
    description: '',
    status: 'Revision',
    partner: null,
    template: '',
    inputProperties: {
      connectionType: '',
      connection: '',
      inputMustExist: false,
      path: '',
      archivePath: '',
      filePattern: ''
    },
    responseProperties: {
      connectionType: '',
      connection: '',
      path: '',
      archivePath: '',
      filePattern: ''
    },
    scheduling: {
      repeating: false
    },
    alerts: [],
    dependencies: [],
    errorCodeMapping: [],
    parameters: []
  });
  
  const [data, setData] = useState<any>({});
  const [formGroup, setFormGroup] = useState<any>({ valid: false });
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletePermission, setDeletePermission] = useState(false);
  const [publishPerm, setPublishPerm] = useState(false);
  
  const drawerRef = useRef<any>(null);
  
  const { successAlert, errorAlert } = useAlert();
  const { open } = useDialog();
  const { checkPerms } = useUtils();
  const { 
    getIntegrations, 
    postIntegration, 
    publishIntegration, 
    getNextRuns 
  } = useIntegrations();

  // Map for property paths
  const propertiesMap = {
    'integration_properties': 'integrationProperties',
    'alerts_properties': 'alerts',
    'scheduling_properties': 'scheduling',
    'response_properties': 'responseProperties',
    'dependencies_properties': 'dependencies',
    'input_properties': 'inputProperties',
    'error_code_mapping_properties': 'errorCodeMapping',
    'integration_parameters': 'parameters'
  };

  useEffect(() => {
    // Determine if we're in edit or view mode based on the URL
    const path = window.location.pathname.split('/')[2];
    setIsEdit(path === 'edit');
    setIsView(path === 'detail');
    
    // Check permissions
    const checkPermissions = async () => {
      const hasDeletePerm = await checkPerms({ FX_Integration: ['delete'] });
      const hasPublishPerm = await checkPerms({ FX_PublishIntegration: ['create'] });
      setDeletePermission(hasDeletePerm);
      setPublishPerm(hasPublishPerm);
    };
    
    checkPermissions();
    
    // Get current integration if editing or viewing
    if (id) {
      getCurrentIntegration(id);
    }
    
    // Get required data
    getData();
  }, [id]);

  const getCurrentIntegration = async (integrationId: string) => {
    try {
      const query = JSON.stringify({ _id: integrationId });
      const populate = JSON.stringify({ path: 'updatedBy', select: 'login' });
      
      const integrations = await getIntegrations({ query, populate });
      
      if (integrations && integrations.length > 0) {
        const integrationData = integrations[0];
        
        // If editing, set status to Revision
        if (isEdit) {
          integrationData.status = 'Revision';
        }
        
        setProperties(integrationData);
      }
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const getData = async () => {
    try {
      // In a real implementation, these would fetch from APIs
      // For now, we'll just set some dummy data
      
      // Get partners
      const partnersData = [
        { _id: '1', name: 'Partner 1', isHostingPartner: false },
        { _id: '2', name: 'Partner 2', isHostingPartner: true }
      ];
      setPartners(partnersData.sort((a, b) => a.name.localeCompare(b.name)));
      
      // Get templates
      const templatesData = [
        { _id: '1', name: 'Template 1', partner: '1' },
        { _id: '2', name: 'Template 2', partner: '1' },
        { _id: '3', name: 'Template 3', partner: '2' }
      ];
      setTemplates(templatesData);
      
      // Get integrations
      const integrationsData = [
        { _id: '1', name: 'Integration 1', status: 'Published' },
        { _id: '2', name: 'Integration 2', status: 'Revision' }
      ];
      setIntegrations(integrationsData);
      
      // Set server info for control rate
      if (properties.scheduling && !properties.scheduling.controlRate) {
        setProperties(prev => ({
          ...prev,
          scheduling: {
            ...prev.scheduling,
            controlRate: 10 // Default value, would come from server info
          }
        }));
      }
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const handleIsModifiedChange = (modified: boolean) => {
    setIsModified(modified);
  };

  const updateFormGroup = (formGroupData: any) => {
    setFormGroup(formGroupData);
  };

  const onMenuClick = (activeFieldDetails: any) => {
    setShowProperties(activeFieldDetails);
    
    const propertyPath = propertiesMap[activeFieldDetails as keyof typeof propertiesMap];
    if (propertyPath) {
      setData(properties[propertyPath]);
    } else {
      setData(properties);
    }
  };

  const closeErrorPanel = () => {
    setDrawerOpen(false);
  };

  const onDrawerClosed = () => {
    setDrawerOpen(false);
  };

  const markAsTouched = () => {
    if (formGroup && formGroup.controls) {
      Object.keys(formGroup.controls).forEach(controlName => {
        if (formGroup.controls[controlName].markAsTouched) {
          formGroup.controls[controlName].markAsTouched();
        }
      });
    }
  };

  const getClassName = () => {
    return `status status-${properties.status?.toLowerCase().split(' ').join('')}`;
  };

  const getFormattedDate = (dateTime?: string) => {
    if (dateTime) {
      return format(new Date(dateTime), 'MMM dd, yyyy h:mm a');
    }
    return '';
  };

  const navigate_back = () => {
    if (state?.source !== 'integrations') {
      window.history.back();
    } else {
      navigate('/integrations/list');
    }
  };

  const edit = () => {
    navigate(`/integrations/edit/${properties._id}`, { 
      state: { properties: JSON.parse(JSON.stringify(properties)) }
    });
  };

  const deleteIntegration = () => {
    if (!deletePermission) return;
    
    open({
      schema: 'Delete Integration',
      content: `Are you sure that you want to delete <strong>${properties.name}</strong>?`,
      confirmButton: 'Yes, Delete',
      cancelButton: 'No',
      onConfirm: async () => {
        try {
          await deleteIntegration(properties);
          successAlert('Integration deleted successfully');
          setIsModified(false);
          navigate_back();
        } catch (err: any) {
          errorAlert(err.errorMessage || 'Cannot delete integration');
        }
      }
    });
  };

  const updateMainDataAlerts = (updatedAlerts: any[]) => {
    setProperties(prev => ({
      ...prev,
      alerts: updatedAlerts
    }));
  };

  const updateMainDataDependencies = (updatedDependencies: any[]) => {
    setProperties(prev => ({
      ...prev,
      dependencies: updatedDependencies
    }));
  };

  const updateMainDataECM = (updatedECMs: any[]) => {
    setProperties(prev => ({
      ...prev,
      errorCodeMapping: updatedECMs
    }));
  };

  const updateMainParameters = (updatedParameters: any[]) => {
    setProperties(prev => ({
      ...prev,
      parameters: updatedParameters
    }));
  };

  const validate = async () => {
    closeErrorPanel();
    try {
      await postIntegration(properties, isEdit, true);
      successAlert('Integration validation successful.');
    } catch (err: any) {
      setErrors(err?.errors || []);
      if (err?.errors?.length) {
        setDrawerOpen(true);
      }
    }
  };

  const save = async (publish = false) => {
    closeErrorPanel();
    properties.status = publish ? 'Published' : 'Revision';
    
    try {
      const integrationProperties = await postIntegration(properties, isEdit);
      
      // Update with user details
      const userDetails = { login: 'Current User' }; // This would come from auth service
      integrationProperties.updatedBy = { login: userDetails.login };
      
      successAlert(`Integration successfully ${publish ? 'published' : 'saved'}`);
      setIsModified(false);
      
      navigate(`/integrations/edit/${integrationProperties._id}`, {
        state: {
          properties: JSON.parse(JSON.stringify(integrationProperties)),
          disableDeactivateGuard: true,
          source: 'integrations'
        }
      });
    } catch (err: any) {
      setErrors(err?.errors || []);
      if (err?.errors?.length) {
        setDrawerOpen(true);
      }
    }
  };

  const publish = async () => {
    closeErrorPanel();
    try {
      await postIntegration(properties, true, true);
      
      const nextRuns = await getNextRuns(properties._id || '');
      const schedules = nextRuns?.[0]?.scheduledRuns || [];
      
      let scheduledRuns = schedules.map((field: string) => 
        getFormattedDate(field)
      );
      
      if (scheduledRuns.length > 7) {
        scheduledRuns = [
          ...scheduledRuns.slice(0, 5),
          '...',
          ...scheduledRuns.slice(scheduledRuns.length - 2)
        ];
      }
      
      if (scheduledRuns.length > 0) {
        open({
          schema: 'Publish Integration - Pending Past Triggers',
          content: `Publishing the <strong>${properties.name}</strong> integration will cause it to trigger for past runs because the effective date of the integration is in the past. <br>Would you like to proceed?`,
          confirmButton: 'Proceed',
          cancelButton: 'Cancel',
          listView: true,
          arrayList: scheduledRuns,
          onConfirm: async () => {
            try {
              await publishIntegration(properties._id || '');
              open({
                schema: 'Publish Status',
                content: 'Provisioning backend resources started. Please check integration status to track progress.',
                confirmButton: 'Ok',
                disableCancelButton: true,
                onConfirm: () => {
                  navigate('/integrations', {
                    state: { disableDeactivateGuard: true }
                  });
                }
              });
            } catch (err: any) {
              if (err?.errors?.length) {
                setErrors(err.errors);
                setDrawerOpen(true);
              }
            }
          }
        });
      } else {
        open({
          schema: 'Confirm Action',
          content: 'Are you sure you want to publish integration?',
          confirmButton: 'Yes',
          cancelButton: 'No',
          onConfirm: async () => {
            try {
              await publishIntegration(properties._id || '');
              open({
                schema: 'Publish Status',
                content: 'Provisioning backend resources started. Please check integration status to track progress.',
                confirmButton: 'Ok',
                disableCancelButton: true,
                onConfirm: () => {
                  navigate('/integrations', {
                    state: { disableDeactivateGuard: true }
                  });
                }
              });
            } catch (err: any) {
              if (err?.errors?.length) {
                setErrors(err.errors);
                setDrawerOpen(true);
              }
            }
          }
        });
      }
    } catch (err: any) {
      if (err?.errors?.length) {
        setErrors(err.errors);
        setDrawerOpen(true);
      }
    }
  };

  // Define handlers for the dynamic form
  const handlers = {
    getAllPartners: () => partners,
    getEnumsByType: (type: string) => {
      // This would fetch enums from a service
      // For now, return some dummy data
      const enumsMap: Record<string, any[]> = {
        'RCXProcess': [
          { label: 'Process 1', value: 'process1' },
          { label: 'Process 2', value: 'process2' }
        ],
        'AlertType': [
          { label: 'Error', value: 'Error' },
          { label: 'Warning', value: 'Warning' },
          { label: 'Info', value: 'Info' }
        ],
        'FrequencyType': [
          { label: 'Minutes', value: 'Minutes' },
          { label: 'Hours', value: 'Hours' },
          { label: 'Days', value: 'Days' },
          { label: 'Weeks', value: 'Weeks' }
        ],
        'DataType': [
          { label: 'String', value: 'String' },
          { label: 'Number', value: 'Number' },
          { label: 'Boolean', value: 'Boolean' },
          { label: 'Date', value: 'Date' }
        ],
        'ConnectionType': [
          { label: 'S3', value: 'S3' },
          { label: 'SFTP', value: 'SFTP' }
        ],
        'DependencyType': [
          { label: 'Sequential', value: 'Sequential' },
          { label: 'Parallel', value: 'Parallel' }
        ],
        'RCXErrorCode': [
          { value: '1001', label: 'Error 1001', desc: 'Invalid input format' },
          { value: '1002', label: 'Error 1002', desc: 'Connection failed' }
        ]
      };
      
      return enumsMap[type] || [];
    },
    getTemplatesByParnter: () => {
      const partnerId = properties.partner?._id || properties.partner;
      return templates.filter(t => t.partner === partnerId);
    },
    getConnectionsByParnter: () => {
      const partnerId = properties.partner?._id || properties.partner;
      
      // This would fetch connections from a service
      // For now, return some dummy data
      const connections = [
        { _id: '1', name: 'Connection 1', partner: '1', connectionType: 'S3' },
        { _id: '2', name: 'Connection 2', partner: '1', connectionType: 'SFTP' },
        { _id: '3', name: 'Connection 3', partner: '2', connectionType: 'S3' }
      ];
      
      const hostedPartners = partners
        .filter(p => p.isHostingPartner)
        .map(p => p._id);
      
      return connections.filter(
        c => c.partner === partnerId || hostedPartners.includes(c.partner)
      );
    },
    previewSchedule: async () => {
      // This would show a preview of scheduled runs
      // For now, just show a dialog with some dummy data
      open({
        schema: 'Preview Schedule',
        content: 'The below are the possible future schedules for this integration.',
        confirmButton: 'Ok',
        disableCancelButton: true,
        listView: true,
        arrayList: [
          '2023-10-01 12:00 PM',
          '2023-10-02 12:00 PM',
          '2023-10-03 12:00 PM',
          '2023-10-04 12:00 PM',
          '2023-10-05 12:00 PM'
        ]
      });
    },
    handleIsModifiedChange
  };

  const enableButton = ['Revision', 'Publish Failed'].includes(properties.status || '');
  const isPublished = properties.status === 'Published';

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-7 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-4">
            <IconButton 
              className="border border-gray-200 rounded-full"
              onClick={navigate_back}
            >
              <ArrowBackIcon />
            </IconButton>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-700">Integrations</Typography>
            <Typography variant="h6" className="font-semibold">
              {properties.name}
            </Typography>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isView && (
            <>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={validate}
                disabled={!formGroup.valid}
                className="bg-blue-800 hover:bg-blue-900"
              >
                Validate
              </Button>
              
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => save(false)}
                disabled={!formGroup.valid}
                className="bg-blue-800 hover:bg-blue-900"
              >
                Save
              </Button>
              
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={publish}
                disabled={!formGroup.valid || !publishPerm || isModified}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Publish
              </Button>
            </>
          )}
          
          {isView && enableButton && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={edit}
              disabled={!checkPerms({ FX_Integration: ['update'] })}
              className="bg-blue-800 hover:bg-blue-900"
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <Box className="relative">
        <div className="childContainer p-6">
          <div className="inner-headerContainer border border-gray-200 border-b-0 rounded-t-lg py-6 px-5 flex justify-between items-center bg-white">
            <div className="left-elements flex items-center">
              <div className="right-child flex gap-4">
                <div className="temp-properties-name text-lg font-semibold">
                  Integration Properties
                </div>
                <div className="buttonBorder">
                  <div>
                    <p className={getClassName()}>
                      {properties.status}
                    </p>
                  </div>
                </div>
                <div className="buttonBorder">
                  <div>
                    <p className={getClassName()}>
                      {!isView ? 'Edit Mode' : 'View Mode'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isEdit && properties?.updatedBy && (
              <div className="right-elements">
                <div className="rightText flex flex-col">
                  <div className="updatestatus flex justify-end">
                    <p className="uname text-base font-medium text-gray-900 mb-0.5">Last Updated By</p>
                  </div>
                  <div className="rightBottomText flex gap-1">
                    <div>
                      <p className="name text-xs font-semibold text-gray-500">{properties?.updatedBy?.login}</p>
                    </div>
                    <div>
                      <span className="material-icons text-sm text-gray-500">schedule</span>
                    </div>
                    <div>
                      <p className="date text-xs font-normal text-gray-500">
                        {getFormattedDate(properties?.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="main-container bottom-radius-none flex border border-gray-200 rounded-b-lg">
            <div className="left-panel integrate-left-panel w-64 border-r-0 bg-white">
              <IntegrationPropertiesMenu
                isView={isView}
                onMenuClick={onMenuClick}
                properties={properties}
                isvalidForm={formGroup.valid}
                validateForm={markAsTouched}
                activeMenuProperties={showProperties}
              />
            </div>
            
            <div className={`right-panel integrate-right-panel w-[calc(100%-16rem)] bg-white ${drawerOpen ? 'panel-open' : ''}`}>
              {showProperties === 'integration_properties' && (
                <IntegrationProperties
                  properties={properties}
                  handlers={handlers}
                  partners={partners}
                  templates={templates}
                  formStatus={updateFormGroup}
                />
              )}
              
              {showProperties === 'alerts_properties' && (
                <AlertsProperties
                  data={properties.alerts}
                  handlers={handlers}
                  isView={isView}
                  dataChange={updateMainDataAlerts}
                />
              )}
              
              {showProperties === 'integration_parameters' && (
                <IntegrationParameters
                  data={properties.parameters}
                  handlers={handlers}
                  isView={isView}
                  dataChange={updateMainParameters}
                />
              )}
              
              {showProperties === 'scheduling_properties' && (
                <SchedulingProperties
                  data={properties.scheduling}
                  handlers={handlers}
                  properties={properties}
                  formStatus={updateFormGroup}
                />
              )}
              
              {showProperties === 'response_properties' && (
                <ResponseProperties
                  data={properties.responseProperties}
                  handlers={handlers}
                  properties={properties}
                  formStatus={updateFormGroup}
                />
              )}
              
              {showProperties === 'dependencies_properties' && (
                <DependenciesProperties
                  data={properties.dependencies}
                  handlers={handlers}
                  integrations={integrations}
                  isView={isView}
                  dataChange={updateMainDataDependencies}
                />
              )}
              
              {showProperties === 'error_code_mapping_properties' && (
                <ErrorCodeMappingProperties
                  data={properties.errorCodeMapping}
                  handlers={handlers}
                  isView={isView}
                  dataChange={updateMainDataECM}
                />
              )}
              
              {showProperties === 'input_properties' && (
                <InputProperties
                  data={properties.inputProperties}
                  handlers={handlers}
                  properties={properties}
                  formStatus={updateFormGroup}
                />
              )}
            </div>
          </div>
          
          {/* Delete Button */}
          <div className="mt-4">
            {(isEdit || isView) && enableButton && (
              <DeleteButton 
                onClick={deleteIntegration} 
                disableButton={isPublished || !deletePermission}
              >
                Delete Integration
              </DeleteButton>
            )}
          </div>
        </div>
        
        {/* Error Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={onDrawerClosed}
          ref={drawerRef}
        >
          <ErrorSidePanel 
            drawer={{ toggle: () => setDrawerOpen(!drawerOpen) }}
            errors={errors}
          />
        </Drawer>
      </Box>
    </div>
  );
};

export default CreateIntegration;