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
  IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface CreateEditIntegrationParameterProps {
  data: {
    row?: any;
    handlers: any;
  };
  onClose: () => void;
  onSave: (parameter: any) => void;
}

const CreateEditIntegrationParameter: React.FC<CreateEditIntegrationParameterProps> = ({ 
  data, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    value: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    type: '',
    value: ''
  });
  
  const [touched, setTouched] = useState({
    name: false,
    type: false,
    value: false
  });

  useEffect(() => {
    if (data.row && !Array.isArray(data.row)) {
      setFormData({
        name: data.row.name || '',
        type: data.row.type || '',
        value: data.row.value || ''
      });
    }
  }, [data.row]);

  const validateField = (name: string, value: string) => {
    if (!value) {
      return `Please enter ${name.toLowerCase()}.`;
    }
    if (value.length > 50) {
      return `${name} cannot exceed 50 characters length.`;
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
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        value: date.toISOString()
      }));
      
      if (touched.value) {
        setErrors(prev => ({
          ...prev,
          value: ''
        }));
      }
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

  const handleParameterTypeChange = () => {
    setFormData(prev => ({
      ...prev,
      value: ''
    }));
  };

  const handleSave = () => {
    // Mark fields as touched to trigger validation
    setTouched({
      name: true,
      type: true,
      value: true
    });
    
    // Validate fields
    const nameError = validateField('name', formData.name);
    const typeError = validateField('type', formData.type);
    const valueError = validateField('value', formData.value);
    
    setErrors({
      name: nameError,
      type: typeError,
      value: valueError
    });
    
    // If no errors, save
    if (!nameError && !typeError && !valueError) {
      if (data.handlers?.handleIsModifiedChange) {
        data.handlers.handleIsModifiedChange(true);
      }
      
      onSave(formData);
    }
  };

  const dataTypes = data.handlers?.getEnumsByType ? 
    data.handlers.getEnumsByType('DataType') : 
    [
      { value: 'String', label: 'String' },
      { value: 'Number', label: 'Number' },
      { value: 'Boolean', label: 'Boolean' },
      { value: 'Date', label: 'Date' }
    ];

  const isFormValid = formData.name && formData.type && formData.value && 
                      !errors.name && !errors.type && !errors.value;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <DialogTitle className="p-0 text-xl font-semibold">Create/Edit Parameter</DialogTitle>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </div>
      
      <DialogContent className="p-0">
        <form className="flex flex-col gap-6 mt-4">
          <TextField
            fullWidth
            label="Parameter Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
            placeholder="Enter Parameter Name"
          />
          
          <FormControl fullWidth error={touched.type && !!errors.type}>
            <InputLabel>Parameter Type *</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={(e) => {
                handleChange(e);
                handleParameterTypeChange();
              }}
              label="Parameter Type *"
              placeholder="Select Parameter Type"
            >
              {dataTypes.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {touched.type && errors.type && (
              <FormHelperText>{errors.type}</FormHelperText>
            )}
          </FormControl>
          
          {formData.type !== 'Date' ? (
            <TextField
              fullWidth
              label="Parameter Value *"
              name="value"
              value={formData.value}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.value && !!errors.value}
              helperText={touched.value && errors.value}
              placeholder="Enter Parameter Value"
            />
          ) : (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Parameter Value *"
                value={formData.value ? new Date(formData.value) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.value && !!errors.value,
                    helperText: touched.value && errors.value,
                    placeholder: "Enter Date",
                    onBlur: () => {
                      setTouched(prev => ({
                        ...prev,
                        value: true
                      }));
                    }
                  }
                }}
              />
            </LocalizationProvider>
          )}
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

export default CreateEditIntegrationParameter;