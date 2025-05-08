import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  FormHelperText, 
  IconButton, 
  Typography 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CreateEditErrorCodeMappingProps {
  data: {
    row?: any;
    handlers: any;
    errorCodes: any[];
  };
  onClose: () => void;
  onSave: (errorCodeMapping: any) => void;
}

const CreateEditErrorCodeMapping: React.FC<CreateEditErrorCodeMappingProps> = ({ 
  data, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    rcxErrorCode: '',
    partnerErrorCode: ''
  });
  
  const [description, setDescription] = useState('Please select the rcxerror code');
  
  const [errors, setErrors] = useState({
    rcxErrorCode: '',
    partnerErrorCode: ''
  });
  
  const [touched, setTouched] = useState({
    rcxErrorCode: false,
    partnerErrorCode: false
  });

  useEffect(() => {
    if (data.row && !Array.isArray(data.row)) {
      setFormData({
        rcxErrorCode: data.row.rcxErrorCode || '',
        partnerErrorCode: data.row.partnerErrorCode || ''
      });
      
      if (data.row.rcxErrorCode) {
        onErrorCodeChange(data.row.rcxErrorCode);
      }
    }
  }, [data.row]);

  const validateField = (name: string, value: string) => {
    if (!value) {
      return `Please ${name === 'rcxErrorCode' ? 'select' : 'enter'} ${name.toLowerCase().replace('rcx', 'RCX ')}.`;
    }
    if (value.length > 50) {
      return `${name.replace('rcx', 'RCX ')} can not exceed 50 characters length.`;
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string };
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name as keyof typeof touched]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
    
    if (name === 'rcxErrorCode') {
      onErrorCodeChange(value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name as keyof typeof formData] as string)
    }));
  };

  const onErrorCodeChange = (errorCodeValue: string) => {
    const errCode = data.errorCodes.find(
      (x) => x.value.toString() === errorCodeValue.toString()
    );
    
    setDescription(errCode?.desc || 'Description not available');
  };

  const handleSave = () => {
    // Mark fields as touched to trigger validation
    setTouched({
      rcxErrorCode: true,
      partnerErrorCode: true
    });
    
    // Validate fields
    const rcxErrorCodeError = validateField('rcxErrorCode', formData.rcxErrorCode);
    const partnerErrorCodeError = validateField('partnerErrorCode', formData.partnerErrorCode);
    
    setErrors({
      rcxErrorCode: rcxErrorCodeError,
      partnerErrorCode: partnerErrorCodeError
    });
    
    // If no errors, save
    if (!rcxErrorCodeError && !partnerErrorCodeError) {
      if (data.handlers?.handleIsModifiedChange) {
        data.handlers.handleIsModifiedChange(true);
      }
      
      const editedErrorCodeMapping = {
        rcxErrorCode: formData.rcxErrorCode,
        errorCodeDes: description,
        partnerErrorCode: formData.partnerErrorCode
      };
      
      onSave(editedErrorCodeMapping);
    }
  };

  const isFormValid = formData.rcxErrorCode && formData.partnerErrorCode && 
                      !errors.rcxErrorCode && !errors.partnerErrorCode;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <DialogTitle className="p-0 text-xl font-semibold">Create/Edit Error Code Mapping</DialogTitle>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </div>
      
      <DialogContent className="p-0">
        <form className="flex flex-col gap-6 mt-4">
          <FormControl fullWidth error={touched.rcxErrorCode && !!errors.rcxErrorCode}>
            <InputLabel>RCX Error Code *</InputLabel>
            <Select
              name="rcxErrorCode"
              value={formData.rcxErrorCode}
              onChange={handleChange}
              label="RCX Error Code *"
              placeholder="Select RCX Error Code"
            >
              {data.errorCodes.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {touched.rcxErrorCode && errors.rcxErrorCode && (
              <FormHelperText>{errors.rcxErrorCode}</FormHelperText>
            )}
          </FormControl>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <Typography variant="subtitle2" className="text-gray-700 mb-1">
              Error Code Description
            </Typography>
            <Typography variant="body1">
              {description}
            </Typography>
          </div>
          
          <TextField
            fullWidth
            label="Partner Error Code *"
            name="partnerErrorCode"
            value={formData.partnerErrorCode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.partnerErrorCode && !!errors.partnerErrorCode}
            helperText={touched.partnerErrorCode && errors.partnerErrorCode}
            placeholder="Enter Partner Error Code"
          />
        </form>
      </DialogContent>
      
      <DialogActions className="p-0 mt-6">
        <Button 
          variant="outlined" 
          onClick={onClose}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!isFormValid}
          className="bg-blue-800 hover:bg-blue-900 text-white"
        >
          Ok
        </Button>
      </DialogActions>
    </div>
  );
};

export default CreateEditErrorCodeMapping;