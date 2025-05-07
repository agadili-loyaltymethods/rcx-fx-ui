import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { 
  Typography, 
  Button, 
  IconButton, 
  Card, 
  CardContent 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { DynamicForm, DeleteButton } from '../../components/common';
import { useUtils } from '../../services/utils/useUtils';
import { useAlert } from '../../services/alert/useAlert';
import { useDialog } from '../../services/dialog/useDialog';
import { Partner } from '../../models/partner';

const CreatePartner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formGroup, setFormGroup] = useState<any>(null);
  const [data, setData] = useState<Partner>(new Partner());
  const [isEdit, setIsEdit] = useState(false);
  const [partnerAction, setPartnerAction] = useState('create');
  const [enumData, setEnumData] = useState<{PartnerType?: any}>({});
  const [isModified, setIsModified] = useState(false);
  const [timeZoneOptions, setTimeZoneOptions] = useState<any[]>([]);
  const [partnerTypeOptions, setPartnerTypeOptions] = useState<any[]>([]);
  const [deletePermission, setDeletePermission] = useState(false);
  
  const { checkPerms } = useUtils();
  const { successAlert, errorAlert } = useAlert();
  const { openDialog } = useDialog();
  
  useEffect(() => {
    // Determine if we're in edit or view mode based on the URL
    const path = window.location.pathname.split('/')[2];
    setIsEdit(path === 'edit');
    setPartnerAction(path);
    
    // Check delete permission
    const checkDeletePermission = async () => {
      const hasPermission = await checkPerms({ FX_Partner: ['delete'] });
      setDeletePermission(hasPermission);
    };
    
    checkDeletePermission();
    
    // Get current partner if editing or viewing
    if (id) {
      getCurrentPartner(id);
    }
    
    // Initialize data
    if (!data.isHostingPartner) {
      setData(prev => ({ ...prev, isHostingPartner: false }));
    }
    if (!data.timezone) {
      setData(prev => ({ ...prev, timezone: 'UTC' }));
    }
    
    // Get required data
    getData();
  }, [id]);

  const getCurrentPartner = async (partnerId: string) => {
    if (!partnerId) return;
    
    try {
      // This would fetch the partner from an API
      // For now, we'll just set some dummy data
      const partnerData = {
        _id: partnerId,
        name: 'Partner ' + partnerId,
        code: 'P' + partnerId,
        partnerType: 'Supplier',
        email: `partner${partnerId}@example.com`,
        phone: '+1234567890',
        timezone: 'UTC',
        isHostingPartner: false
      };
      
      setData(partnerData as Partner);
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const handleIsModifiedChange = (modified: boolean) => {
    setIsModified(modified);
  };

  const canDeactivate = () => {
    if (!isModified) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      openDialog({
        schema: 'Unsaved Changes',
        content: 'There are unsaved changes. Exit without saving?',
        confirmButton: 'Proceed',
        cancelButton: 'Cancel',
        onConfirm: () => resolve(true),
        onClose: () => resolve(false)
      });
    });
  };

  const edit = (row: any) => {
    navigate(`/partners/edit/${row._id}`);
  };

  const deletePartner = () => {
    if (!deletePermission) return;
    
    openDialog({
      schema: 'Delete Partner',
      content: `Are you sure that you want to delete <strong>${data.name}</strong>?`,
      confirmButton: 'Yes, Delete',
      cancelButton: 'No',
      onConfirm: confirmation
    });
  };

  const navigateTo = () => {
    if (location.state?.source !== 'partners') {
      window.history.back();
    } else {
      navigate('/partner/list');
    }
  };

  const confirmation = async () => {
    try {
      // This would delete the partner via API
      // await deletePartner(data);
      successAlert('Partner deleted successfully');
      setIsModified(false);
      navigateTo();
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Cannot delete partner');
    }
  };

  const getData = async () => {
    try {
      // This would fetch enums and programs from APIs
      // For now, we'll just set some dummy data
      const enums = [
        { type: 'PartnerType', label: 'Supplier', value: 'Supplier' },
        { type: 'PartnerType', label: 'Customer', value: 'Customer' },
        { type: 'PartnerType', label: 'Distributor', value: 'Distributor' },
        { type: 'timeZone', label: 'UTC', value: 'UTC' },
        { type: 'timeZone', label: 'EST', value: 'EST' },
        { type: 'timeZone', label: 'PST', value: 'PST' }
      ];
      
      const programs = [
        { _id: '1', name: 'Program 1' },
        { _id: '2', name: 'Program 2' }
      ];
      
      // Process enums
      const enumDataObj: any = {};
      for (const x of enums) {
        if (!enumDataObj[x.type]) {
          enumDataObj[x.type] = [];
        }
        enumDataObj[x.type].push(x);
      }
      
      enumDataObj.program = programs;
      setEnumData(enumDataObj);
      
      // Set timezone and partner type options
      setTimeZoneOptions(enumDataObj.timeZone || []);
      setPartnerTypeOptions(enumDataObj.PartnerType || []);
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Error fetching data');
    }
  };

  const updateFormGroup = (formGroupData: any) => {
    setFormGroup(formGroupData);
    
    // Add search filtering for partner type and timezone
    if (formGroupData.controls?.partnerFormControl?.valueChanges) {
      formGroupData.controls.partnerFormControl.valueChanges.subscribe((searchTerm: string) => {
        setEnumData(prev => ({
          ...prev,
          PartnerType: filterOptions(searchTerm, partnerTypeOptions)
        }));
      });
    }
    
    if (formGroupData.controls?.timeZoneFormControl?.valueChanges) {
      formGroupData.controls.timeZoneFormControl.valueChanges.subscribe((searchTerm: string) => {
        setEnumData(prev => ({
          ...prev,
          timeZone: filterOptions(searchTerm, timeZoneOptions)
        }));
      });
    }
  };

  const filterOptions = (searchTerm: string, options: any[]) => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const savePartner = async () => {
    setIsModified(false);
    try {
      // This would save the partner via API
      // await updatePartner(data, isEdit);
      successAlert('Partner saved successfully');
      navigate('/partners');
    } catch (err: any) {
      errorAlert(err.errorMessage || 'Something went wrong. Please try again later.');
    }
  };

  const getClassName = () => {
    return `status status-${data.status?.toLowerCase().split(' ').join('') || 'revision'}`;
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-7 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-4">
            <IconButton 
              className="border border-gray-200 rounded-full"
              onClick={navigateTo}
            >
              <ArrowBackIcon />
            </IconButton>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-700">Partners</Typography>
            <Typography variant="h6" className="font-semibold">
              {formGroup?.controls?.['name']?.value || data.name || ''}
            </Typography>
          </div>
        </div>
        
        <div className="flex gap-2">
          {partnerAction === 'edit' || partnerAction === 'create' ? (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={savePartner}
              disabled={!formGroup?.valid}
              className="bg-blue-800 hover:bg-blue-900"
            >
              Save
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<span className="material-icons">edit</span>}
              onClick={() => edit(data)}
              disabled={!checkPerms({ FX_Partner: ['update'] })}
              className="bg-blue-800 hover:bg-blue-900"
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        <Card className="border border-gray-200 rounded-t-lg">
          <div className="flex items-center px-5 py-6 border-b border-gray-200">
            <Typography variant="h6" className="font-semibold">
              Partner Details
            </Typography>
            
            {partnerAction !== 'create' && (
              <div className="ml-4 px-3 py-1 text-xs font-medium rounded border border-amber-500 text-amber-800">
                {data.status || 'Revision'}
              </div>
            )}
            
            {partnerAction !== 'view' && (
              <div className="ml-4 px-3 py-1 text-xs font-medium rounded border border-blue-500 text-blue-800">
                Edit Mode
              </div>
            )}
            
            {partnerAction === 'view' && (
              <div className="ml-4 px-3 py-1 text-xs font-medium rounded border border-gray-500 text-gray-800">
                View Mode
              </div>
            )}
          </div>
          
          <CardContent>
            {/* Dynamic Form */}
            {Object.keys(enumData).length > 0 && (
              <DynamicForm
                config={{
                  data: {
                    Partnerdata: {
                      dataFields: [
                        {
                          fields: [
                            {
                              field: 'name',
                              label: 'Partner Name',
                              type: 'text',
                              required: true
                            },
                            {
                              field: 'partnerType',
                              label: 'Partner Type',
                              type: 'select-search',
                              selectData: 'PartnerType',
                              selectLabel: 'label',
                              selectValue: 'value',
                              required: true,
                              formControl: 'partnerFormControl'
                            },
                            {
                              field: 'code',
                              label: 'Code',
                              type: 'text',
                              required: true
                            },
                            {
                              field: 'email',
                              label: 'Support Email',
                              type: 'text',
                              required: true,
                              regExp: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
                            },
                            {
                              field: 'phone',
                              label: 'Support Number',
                              type: 'text'
                            },
                            {
                              field: 'timezone',
                              label: 'Timezone',
                              type: 'select-search',
                              selectData: 'timeZone',
                              selectLabel: 'label',
                              selectValue: 'value',
                              required: true,
                              formControl: 'timeZoneFormControl'
                            },
                            {
                              field: 'isHostingPartner',
                              label: 'Hosting Partner',
                              type: 'switch'
                            }
                          ]
                        }
                      ]
                    }
                  }
                }}
                data={data}
                title="Partnerdata"
                requiredData={enumData}
                formStatus={updateFormGroup}
                isModifiedChanged={handleIsModifiedChange}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Delete Button */}
        <div className="mt-4">
          {(partnerAction === 'detail' || partnerAction === 'edit') && (
            <DeleteButton 
              onClick={deletePartner} 
              disableButton={!deletePermission}
            >
              Delete Partner
            </DeleteButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePartner;