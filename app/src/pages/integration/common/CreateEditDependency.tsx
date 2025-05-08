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
import { DropDownWithSearch } from '@/components/common';

interface CreateEditDependencyProps {
  data: {
    row?: any;
    handlers: any;
    integrations: any[];
  };
  onClose: () => void;
  onSave: (dependency: any) => void;
}

const CreateEditDependency: React.FC<CreateEditDependencyProps> = ({ 
  data, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    list: [] as any[]
  });
  
  const [errors, setErrors] = useState({
    name: '',
    type: ''
  });
  
  const [touched, setTouched] = useState({
    name: false,
    type: false
  });

  useEffect(() => {
    if (data.row) {
      const initialList = data.row.list || [];
      const mappedList = Array.isArray(initialList) 
        ? initialList.map((id: string) => {
            const integration = data.integrations.find(i => i.id === id);
            return integration || null;
          }).filter(Boolean)
        : [];
      
      setFormData({
        name: data.row.name || '',
        type: data.row.type || '',
        list: mappedList
      });
    }
  }, [data.row, data.integrations]);

  const validateField = (name: string, value: string) => {
    if (!value) {
      return `Please enter ${name.toLowerCase()}.`;
    }
    if (value.length > 50) {
      return `${name} can not exceed 50 characters length.`;
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

  const handleDependencyListChange = (options: { input: any[] }) => {
    setFormData(prev => ({
      ...prev,
      list: options.input || []
    }));
  };

  const handleSave = () => {
    // Mark fields as touched to trigger validation
    setTouched({
      name: true,
      type: true
    });
    
    // Validate fields
    const nameError = validateField('name', formData.name);
    const typeError = validateField('type', formData.type);
    
    setErrors({
      name: nameError,
      type: typeError
    });
    
    // If no errors, save
    if (!nameError && !typeError) {
      if (data.handlers?.handleIsModifiedChange) {
        data.handlers.handleIsModifiedChange(true);
      }
      
      const editedDependency = {
        name: formData.name,
        type: formData.type,
        list: formData.list.map(item => item.id)
      };
      
      onSave(editedDependency);
    }
  };

  const dependencyTypes = data.handlers?.getEnumsByType ? 
    data.handlers.getEnumsByType('DependencyType') : 
    [
      { value: 'Sequential', label: 'Sequential' },
      { value: 'Parallel', label: 'Parallel' }
    ];

  const isFormValid = formData.name && formData.type && !errors.name && !errors.type;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <DialogTitle className="p-0 text-xl font-semibold">Create/Edit Dependency</DialogTitle>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </div>
      
      <DialogContent className="p-0">
        <form className="flex flex-col gap-6 mt-4">
          <TextField
            fullWidth
            label="Dependency Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
            placeholder="Enter Dependency Name"
          />
          
          <FormControl fullWidth error={touched.type && !!errors.type}>
            <InputLabel>Dependency Type *</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Dependency Type *"
              placeholder="Select Dependency type"
            >
              {dependencyTypes.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {touched.type && errors.type && (
              <FormHelperText>{errors.type}</FormHelperText>
            )}
          </FormControl>
          
          <div>
            <InputLabel className="mb-2">Integration Dependencies</InputLabel>
            <DropDownWithSearch
              placeHolder="Search by Integration"
              placeHolderSearchBox="Search by Integration"
              selectBoxOptions={data.integrations}
              selectedValue={formData.list}
              multiple={true}
              valueChange={handleDependencyListChange}
            />
          </div>
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

export default CreateEditDependency;