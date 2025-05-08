import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  FormHelperText, 
  IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CreateEditAlertProps {
  data: {
    row: any;
    handlers: any;
  };
  onClose: () => void;
  onSave: (formData: any) => void;
}

const CreateEditAlert: React.FC<CreateEditAlertProps> = ({ 
  data, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    email: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    type: '',
    email: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    type: false,
    email: false
  });

  useEffect(() => {
    if (data.row && !Array.isArray(data.row)) {
      setFormData({
        name: data.row.name || '',
        type: data.row.type || '',
        email: data.row.email || ''
      });
    }
  }, [data.row]);

  const validateField = (name: string, value: string) => {
    let error = '';
    
    if (!value) {
      error = `Please enter ${name.toLowerCase()}.`;
    } else if (name === 'name' && value.length > 50) {
      error = `${name} cannot exceed 50 characters length.`;
    } else if (name === 'type' && value.length > 50) {
      error = `${name} cannot exceed 50 characters length.`;
    } else if (name === 'email') {
      if (value.length > 500) {
        error = `${name} cannot exceed 500 characters length.`;
      } else {
        // Basic email validation
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+(\.[a-z]{2,4})(,[a-z0-9._%+-]+@[a-z0-9.-]+(\.[a-z]{2,4}))*$/;
        if (!emailRegex.test(value)) {
          error = 'Please enter valid email.';
        }
      }
    }
    
    return error;
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
        [name]: validateField(name, value as string)
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched to trigger validation
    const allTouched = {
      name: true,
      type: true,
      email: true
    };
    setTouched(allTouched);
    
    // Validate all fields
    const newErrors = {
      name: validateField('name', formData.name),
      type: validateField('type', formData.type),
      email: validateField('email', formData.email)
    };
    setErrors(newErrors);
    
    // Check if there are any errors
    if (!newErrors.name && !newErrors.type && !newErrors.email) {
      if (data.handlers?.handleIsModifiedChange) {
        data.handlers.handleIsModifiedChange(true);
      }
      onSave(formData);
    }
  };

  const alertTypes = data.handlers?.getEnumsByType ? 
    data.handlers.getEnumsByType('AlertType') : 
    [
      { value: 'Error', label: 'Error' },
      { value: 'Warning', label: 'Warning' },
      { value: 'Info', label: 'Info' }
    ];

  const isFormValid = !errors.name && !errors.type && !errors.email && 
                      formData.name && formData.type && formData.email;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <DialogTitle className="p-0 text-xl font-semibold">Create/Edit Alert</DialogTitle>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </div>
      
      <DialogContent className="p-0">
        <form className="flex flex-col gap-6 mt-4">
          <TextField
            fullWidth
            label="Alert Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
            placeholder="Enter Alert Name"
          />
          
          <FormControl fullWidth error={touched.type && !!errors.type}>
            <InputLabel>Alert Type *</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Alert Type *"
              placeholder="Select Alert Type"
            >
              {alertTypes.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {touched.type && errors.type && (
              <FormHelperText>{errors.type}</FormHelperText>
            )}
          </FormControl>
          
          <TextField
            fullWidth
            label="Notification Email Address *"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
            placeholder="Enter notification email address"
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
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="bg-blue-800 hover:bg-blue-900 text-white"
        >
          Ok
        </Button>
      </DialogActions>
    </div>
  );
};

export default CreateEditAlert;