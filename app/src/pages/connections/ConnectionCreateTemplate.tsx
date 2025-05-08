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
import { DynamicForm, DeleteButton, ErrorSidePanel } from '../../components/common';
import { useConnectionUtils } from '../../services/connection-utils/useConnectionUtils';
import { useConnections } from '../../services/connections/useConnections';
import { useAlert } from '../../services/alert/useAlert';
import { useUtils } from '../../services/utils/useUtils';
import { Connection } from '../../models/connection';
import { useDialog } from '@/components/Dialog/useDialog';

interface FormGroup {
  controls: {
    [key: string]: {
      value: any;
      errors: any;
      valid: boolean;
    }
  };
  valid: boolean;
}

const ConnectionCreateTemplate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  
  const [data, setData] = useState<Connection>(new Connection());
  const [formGroup, setFormGroup] = useState<FormGroup | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [enumData, setEnumData] = useState<any>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isModified, setIsModified] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletePermission, setDeletePermission] = useState(false);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<File | null>(null);
  
  const drawerRef = useRef<any>(null);
  
  const { successAlert, errorAlert } = useAlert();
  const { open } = useDialog();
  const { checkPerms, parseError } = useUtils();
  const { getConnections, postConnections, connectionsValidate } = useConnections();
  const { navigate: navigateBack } = useConnectionUtils();

  useEffect(() => {
    // Determine if we're in edit or view mode based on the URL
    const path = window.location.pathname.split('/')[2];
    setIsEdit(path === 'edit');
    setIsView(path === 'detail');
    
    // Check delete permission
    const checkDeletePermission = async () => {
      const hasPermission = await checkPerms({ FX_Connection: ['delete'] });
      setDeletePermission(hasPermission);
    };
    
    checkDeletePermission();
    
    // Get current connection if editing or viewing
    if (id) {
      getCurrentConnection(id);
    }
    
    // Get enum data and other required data
    getData();
  }, [id]);

  const getCurrentConnection = async (connectionId: string) => {
    if (!connectionId) return;
    
    try {
      let connectionData: any[] = [];
      const query = JSON.stringify({ _id: connectionId });
      
      // Try to get S3 connection first
      connectionData = await getConnections('s3', { query });
      
      // If not found, try SFTP
      if (!connectionData.length) {
        connectionData = await getConnections('sftp', { query });
      }
      
      if (connectionData.length > 0) {
        setData(connectionData[0]);
      }
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const getData = async () => {
    try {
      // This would be implemented to fetch partners, enums, etc.
      // For now, we'll just set up a basic structure
      setEnumData({
        ConnectionType: [
          { label: 'S3', value: 'S3' },
          { label: 'SFTP', value: 'SFTP' }
        ],
        AuthenticationType: [
          { label: 'Password', value: 'Password' },
          { label: 'Key', value: 'Key' }
        ],
        CompressionAlgorithmType: [
          { label: 'GZIP', value: 'GZIP' },
          { label: 'ZIP', value: 'ZIP' }
        ],
        EncryptionAlgorithmType: [
          { label: 'AES', value: 'AES' },
          { label: 'RSA', value: 'RSA' }
        ],
        AWSRegion: [
          { label: 'us-east-1', value: 'us-east-1' },
          { label: 'us-west-1', value: 'us-west-1' }
        ]
      });
      
      // Fetch partners data
      // This would be implemented to fetch from an API
      setPartners([
        { _id: '1', name: 'Partner 1' },
        { _id: '2', name: 'Partner 2' }
      ]);
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const handleIsModifiedChange = (modified: boolean) => {
    setIsModified(modified);
  };

  const updateFormGroup = (formGroupData: FormGroup) => {
    setFormGroup(formGroupData);
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = event.target.files?.[0];
    if (file) {
      if (key === 'keyFile') {
        setKeyFile(file);
      } else if (key === 'encryptionKey') {
        setEncryptionKey(file);
      }
      
      readFileContent(file, key);
    }
  };

  const readFileContent = (file: File, key: string) => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const fileContent = e.target?.result as string;
      
      // Update the form control with the file content
      if (formGroup && formGroup.controls[key]) {
        const updatedData = { ...data, [key]: fileContent };
        setData(updatedData);
      }
    };
    
    reader.readAsText(file);
  };

  const toggle = (item: any) => {
    if (item.field === 'encryptionEnabled') {
      const updatedData = { 
        ...data, 
        encryptionAlgorithm: null,
        encryptPassphrase: null
      };
      setData(updatedData);
    }
    
    if (item.field === 'compressionEnabled') {
      const updatedData = { 
        ...data, 
        compressionAlgorithm: null
      };
      setData(updatedData);
    }
  };

  const compareTestedData = () => {
    let checkArr: string[] = [];
    
    if (data.connectionType === 'S3') {
      checkArr = ['url', 'accessKeyId', 'secretAccessKey', 'region'];
    } else {
      checkArr = ['url', 'userName', 'password'];
    }
    
    // This would compare the current data with the last tested data
    // For now, we'll just return the current tested status
    return data.tested;
  };

  const save = async () => {
    setIsModified(false);
    try {
      const dataCopy = { ...data, tested: compareTestedData(), lastTestedAt: new Date() };
      
      const formData = new FormData();
      if (keyFile) {
        formData.append('keyFile', keyFile, keyFile.name);
      }
      if (encryptionKey) {
        formData.append('encryptionKey', encryptionKey, encryptionKey.name);
      }
      
      formData.append('data', JSON.stringify(dataCopy));
      
      await postConnections(formData, isEdit, data);
      navigate('/connections');
      successAlert('Connection successfully saved.');
    } catch (err: any) {
      if (err.errorMessage === 'Validation Error') {
        // Parse validation errors
        const dbToUIFieldMappings = {}; // This would be populated from config
        const parsedErrors = parseError(err, dbToUIFieldMappings);
        setErrors(parsedErrors);
        setDrawerOpen(true);
        return;
      }
      
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const test = async () => {
    try {
      const connections = [{ ...data }]; // Prepare connections for test
      
      const formData = new FormData();
      if (keyFile) {
        formData.append('keyFile', keyFile, keyFile.name);
      }
      
      formData.append('data', JSON.stringify(data));
      
      const testResult = await connectionsValidate(formData);
      
      if (testResult) {
        open({
          schema: 'Connection Established',
          message: 'Test Successful',
          disableCancelButton: true,
          confirmButton: 'Ok',
          type: 'successDialog'
        });
        
        // Update data with tested status
        setData({ ...data, tested: true });
      }
    } catch (err: any) {
      let errorContent = '';
      const errorMessage = err.errorMessage || 'Something went wrong. Please try again later.';
      
      if (err.errorCode === 1508) {
        const errKeys = Object.keys(err.errors || {});
        errorContent = errKeys.map(key => ({
          key,
          value: err.errors[key]
        }));
      }
      
      open({
        schema: 'Connection Failed',
        disableCancelButton: true,
        confirmButton: 'Ok',
        content: errorContent || errorMessage,
        type: errorContent ? 'errorDialog' : undefined
      });
    }
  };

  const edit = (row: any) => {
    navigate(`/connections/edit/${row._id}`);
  };

  const deleteConnection = () => {
    if (!deletePermission) return;
    
    open({
      schema: 'Delete Connection',
      content: `Are you sure that you want to delete <strong>${data.name}</strong>?`,
      confirmButton: 'Yes, Delete',
      cancelButton: 'No',
      onConfirm: confirmation
    });
  };

  const confirmation = async () => {
    try {
      // This would delete the connection
      // await deleteConnections(data);
      successAlert('Connection deleted successfully');
      setIsModified(false);
      navigateBack();
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Cannot delete connection');
    }
  };

  const onDrawerClosed = () => {
    setDrawerOpen(false);
  };

  // Define handlers for the dynamic form
  const handlers = {
    onFileSelected,
    handleChange: toggle
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-7 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-4">
            <IconButton 
              className="border border-gray-200 rounded-full"
              onClick={() => navigateBack()}
            >
              <ArrowBackIcon />
            </IconButton>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-700">Connections</Typography>
            <Typography variant="h6" className="font-semibold">
              {data.name}
            </Typography>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isView && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={test}
                disabled={!formGroup?.valid}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Test
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={save}
                disabled={!formGroup?.valid}
                className="bg-blue-800 hover:bg-blue-900"
              >
                Save
              </Button>
            </>
          )}
          
          {isView && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<span className="material-icons">edit</span>}
              onClick={() => edit(data)}
              disabled={!checkPerms({ FX_Connection: ['update'] })}
              className="bg-blue-800 hover:bg-blue-900"
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <Box className="relative">
        <div className="p-6">
          <div className="border border-gray-200 rounded-t-lg">
            <div className="flex items-center px-5 py-6 border-b border-gray-200">
              <Typography variant="h6" className="font-semibold">
                Connection Details
              </Typography>
            </div>
            
            <div className="bg-white border-gray-200 rounded-b-lg min-h-[600px]">
              <div className="w-full p-2.5">
                {/* Dynamic Form */}
                {enumData && Object.keys(enumData).length > 0 && (
                  <DynamicForm
                    config={{
                      data: {
                        Connectiondata: {
                          dataFields: [
                            {
                              fields: [
                                {
                                  field: 'name',
                                  label: 'Connection Name',
                                  type: 'text',
                                  required: true
                                },
                                {
                                  field: 'partner',
                                  label: 'Partner',
                                  type: 'select',
                                  selectData: 'partners',
                                  selectLabel: 'name',
                                  selectValue: '_id',
                                  required: true
                                },
                                {
                                  field: 'description',
                                  label: 'Description',
                                  type: 'text'
                                },
                                {
                                  field: 'connectionType',
                                  label: 'Connection Type',
                                  type: 'select',
                                  selectData: 'ConnectionType',
                                  selectLabel: 'label',
                                  selectValue: 'value',
                                  required: true
                                },
                                // Additional fields would be added based on connection type
                                // S3 specific fields
                                {
                                  field: 'url',
                                  label: 'URL',
                                  type: 'text',
                                  required: true,
                                  dispCondField: 'connectionType',
                                  dispCondValue: 'S3'
                                },
                                {
                                  field: 'accessKeyId',
                                  label: 'Access Key ID',
                                  type: 'text',
                                  required: true,
                                  dispCondField: 'connectionType',
                                  dispCondValue: 'S3'
                                },
                                {
                                  field: 'secretAccessKey',
                                  label: 'Secret Access Key',
                                  type: 'password',
                                  required: true,
                                  dispCondField: 'connectionType',
                                  dispCondValue: 'S3'
                                },
                                {
                                  field: 'region',
                                  label: 'Region',
                                  type: 'select',
                                  selectData: 'AWSRegion',
                                  selectLabel: 'label',
                                  selectValue: 'value',
                                  required: true,
                                  dispCondField: 'connectionType',
                                  dispCondValue: 'S3'
                                },
                                // SFTP specific fields
                                {
                                  field: 'url',
                                  label: 'URL',
                                  type: 'text',
                                  required: true,
                                  dispCondField: 'connectionType',
                                  dispCondValue: 'SFTP'
                                },
                                {
                                  field: 'userName',
                                  label: 'Username',
                                  type: 'text',
                                  required: true,
                                  dispCondField: 'connectionType',
                                  dispCondValue: 'SFTP'
                                },
                                {
                                  field: 'authenticationType',
                                  label: 'Authentication Type',
                                  type: 'select',
                                  selectData: 'AuthenticationType',
                                  selectLabel: 'label',
                                  selectValue: 'value',
                                  required: true,
                                  dispCondField: 'connectionType',
                                  dispCondValue: 'SFTP'
                                },
                                {
                                  field: 'password',
                                  label: 'Password',
                                  type: 'password',
                                  required: true,
                                  dispCondField: 'authenticationType',
                                  dispCondValue: 'Password',
                                  disableCondField: 'connectionType',
                                  disableCondValue: 'S3'
                                },
                                {
                                  field: 'keyFile',
                                  label: 'Key File',
                                  type: 'fileUpload',
                                  required: true,
                                  dispCondField: 'authenticationType',
                                  dispCondValue: 'Key',
                                  disableCondField: 'connectionType',
                                  disableCondValue: 'S3'
                                },
                                {
                                  field: 'keyPassphrase',
                                  label: 'Key Passphrase',
                                  type: 'password',
                                  dispCondField: 'authenticationType',
                                  dispCondValue: 'Key',
                                  disableCondField: 'connectionType',
                                  disableCondValue: 'S3'
                                },
                                // Encryption section
                                {
                                  field: 'encryptionEnabled',
                                  label: 'Encryption',
                                  type: 'switch',
                                  icon: 'lock',
                                  toggle: 'handleChange'
                                },
                                {
                                  field: 'encryptionAlgorithm',
                                  label: 'Encryption Algorithm',
                                  type: 'select',
                                  selectData: 'EncryptionAlgorithmType',
                                  selectLabel: 'label',
                                  selectValue: 'value',
                                  required: true,
                                  dispCondField: 'encryptionEnabled',
                                  dispCondValue: true
                                },
                                {
                                  field: 'encryptionKey',
                                  label: 'Encryption Key',
                                  type: 'fileUpload',
                                  required: true,
                                  dispCondField: 'encryptionEnabled',
                                  dispCondValue: true
                                },
                                // Compression section
                                {
                                  field: 'compressionEnabled',
                                  label: 'Compression',
                                  type: 'switch',
                                  icon: 'compress',
                                  toggle: 'handleChange'
                                },
                                {
                                  field: 'compressionAlgorithm',
                                  label: 'Compression Algorithm',
                                  type: 'select',
                                  selectData: 'CompressionAlgorithmType',
                                  selectLabel: 'label',
                                  selectValue: 'value',
                                  required: true,
                                  dispCondField: 'compressionEnabled',
                                  dispCondValue: true
                                },
                                {
                                  field: 'compressionLevel',
                                  label: 'Compression Level',
                                  type: 'number',
                                  required: true,
                                  dispCondField: 'compressionEnabled',
                                  dispCondValue: true
                                }
                              ]
                            }
                          ]
                        }
                      }
                    }}
                    data={data}
                    title="Connectiondata"
                    requiredData={{
                      ...enumData,
                      partners: partners
                    }}
                    handlers={handlers}
                    formStatus={updateFormGroup}
                    isModifiedChanged={handleIsModifiedChange}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Delete Button */}
          <div className="mt-4">
            {(isEdit || isView) && (
              <DeleteButton 
                onClick={deleteConnection} 
                disableButton={!deletePermission}
              >
                Delete Connection
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

export default ConnectionCreateTemplate;