import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  Switch,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DropDownWithSearch from '../DropDownWithSearch';
import _ from 'lodash';

interface Field {
  field: string;
  label: string;
  type: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  regExp?: string;
  placeHolder?: string;
  autofocus?: boolean;
  toolTip?: string;
  dynamicToolTip?: boolean;
  selectData?: string;
  selectLabel?: string;
  selectValue?: string;
  value?: any[];
  icon?: string;
  iconName?: string;
  labelicon?: boolean;
  clickHandler?: string;
  selectionChange?: string;
  showBasedOn?: string[];
  showButton?: boolean;
  displayCondField?: string;
  displayCondValue?: string[] | any;
  dispCondField?: string | object;
  dispCondValue?: any;
  dispCondPar?: string;
  dispNotCondField?: string;
  dispNotCondValue?: string;
  disableCondField?: string;
  disableCondValue?: string;
  disableCondPar?: string;
  disabledOnEdit?: boolean;
  disabled?: boolean;
  disableBasedOn?: string;
  hideInput?: boolean;
  hideLabel?: boolean;
  class?: string;
  formControl?: string;
  toggle?: string;
  fieldsToDelete?: string[];
}

interface DataField {
  fields: Field[];
}

interface DynamicFormProps {
  config: any;
  data: any;
  title: string;
  requiredData?: any;
  properties?: any;
  handlers?: any;
  activeFieldDetails?: any;
  formStatus?: (formGroup: any) => void;
  isModifiedChanged?: (isModified: boolean) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  data,
  title,
  requiredData = {},
  properties,
  handlers = {},
  activeFieldDetails,
  formStatus,
  isModifiedChanged
}) => {
  const [formValues, setFormValues] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  const [formTouched, setFormTouched] = useState<any>({});
  const [isModified, setIsModified] = useState(false);
  const [dataFields, setDataFields] = useState<DataField[]>([]);

  useEffect(() => {
    if (config?.data?.[title]?.dataFields) {
      setDataFields(config.data[title].dataFields);
    }
  }, [config, title]);

  useEffect(() => {
    if (data) {
      setFormValues(data);
    }
  }, [data]);

  useEffect(() => {
    if (isModifiedChanged) {
      isModifiedChanged(isModified);
    }
  }, [isModified, isModifiedChanged]);

  useEffect(() => {
    if (formStatus) {
      formStatus({
        value: formValues,
        errors: formErrors,
        valid: Object.keys(formErrors).length === 0,
        controls: Object.keys(formValues).reduce((acc, key) => {
          acc[key] = {
            value: formValues[key],
            errors: formErrors[key] ? { [formErrors[key]]: true } : null,
            valid: !formErrors[key],
            touched: formTouched[key] || false
          };
          return acc;
        }, {})
      });
    }
  }, [formValues, formErrors, formTouched, formStatus]);

  const handleChange = (field: string, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    setFormTouched(prev => ({ ...prev, [field]: true }));
    setIsModified(true);
    validateField(field, value);
    
    // Call selection change handler if provided
    const fieldConfig = findFieldConfig(field);
    if (fieldConfig?.selectionChange && handlers[fieldConfig.selectionChange]) {
      handlers[fieldConfig.selectionChange]({ controls: { [field]: { value } } }, fieldConfig, value, 'fromSelectionChange');
    }
  };

  const handleBlur = (field: string) => {
    setFormTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formValues[field]);
  };

  const validateField = (field: string, value: any) => {
    const fieldConfig = findFieldConfig(field);
    if (!fieldConfig) return;

    let error = null;

    if (fieldConfig.required && (value === undefined || value === null || value === '')) {
      error = 'required';
    } else if (fieldConfig.minLength && value?.length < fieldConfig.minLength) {
      error = 'minlength';
    } else if (fieldConfig.maxLength && value?.length > fieldConfig.maxLength) {
      error = 'maxlength';
    } else if (fieldConfig.regExp && !new RegExp(fieldConfig.regExp).test(value)) {
      error = 'pattern';
    }

    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const findFieldConfig = (fieldName: string): Field | undefined => {
    for (const dataField of dataFields) {
      for (const field of dataField.fields) {
        if (field.field === fieldName) {
          return field;
        }
      }
    }
    return undefined;
  };

  const displayConditionBased = (item: Field): boolean => {
    if (item.hideInput) return false;
    
    if (item.dispCondField) {
      if (typeof item.dispCondField === 'object') {
        return Object.keys(item.dispCondField).every(element => {
          const value = _.get(data, element);
          return value === item.dispCondValue[element];
        });
      } else {
        const value = _.get(data, item.dispCondField);
        if (item.dispCondValue[item.dispCondField]?.in) {
          return item.dispCondValue[item.dispCondField].in.includes(value);
        }
        return value === item.dispCondValue;
      }
    }

    if (item.dispNotCondField) {
      const value = _.get(data, item.dispNotCondField);
      if (!value) {
        return false;
      }
      return !(value === item.dispNotCondValue);
    }

    return true;
  };

  const disableConditionBased = (item: Field): boolean => {
    if (item.disabled) {
      return true;
    }
    
    if (item.disabledOnEdit) {
      return true;
    }
    
    if (item.disableCondField) {
      const value = _.get(data, item.disableCondField);
      return !(value === item.disableCondValue);
    }
    
    if (item.disableBasedOn && data[item.disableBasedOn]) {
      return true;
    }
    
    return false;
  };

  const shouldDisplayAsterisk = (item: Field): boolean => {
    const parCond = _.get(data, item.disableCondField || '');

    if (item.required) {
      if (!item.disableCondField || (item.disableCondField && parCond)) {
        return true;
      }
    }

    return false;
  };

  const showBasedOn = (fields?: string[]): boolean => {
    if (fields && fields.length) {
      for (const field of fields) {
        if (!data[field]) {
          return false;
        }
      }
    }
    return true;
  };

  const displayAddButton = (item: Field): boolean => {
    const value = _.get(data, item.displayCondField || '');
    if (item.showButton && item.displayCondValue?.includes(value)) {
      return true;
    }
    return false;
  };

  const handleClick = (item: Field) => {
    if (!item.clickHandler || !handlers[item.clickHandler]) {
      return;
    }
    return handlers[item.clickHandler](data);
  };

  const getTooltipText = (item: Field) => {
    if (item.toolTip) {
      return item.toolTip;
    }

    if (item.dynamicToolTip) {
      return formValues[item.field];
    }
    
    return '';
  };

  const filterDataByContext = (data: any[] = [], item: Field) => {
    if (!data) return [];
    const context = item.context;
    const selectedDataType = formValues[context];

    if (formValues.dataType === 'String' || formValues.dataType === 'Boolean') {
      return data.filter(entry => entry.context === selectedDataType || !entry.context);
    }
    if (item.selectData === "TransformType") {
      return data.filter(entry => entry.context === selectedDataType);
    }
    if (item.field === "format" && formValues.transform !== "DateTransform") {
      return data.filter(entry => entry.context === "RCX-Format");
    }
    if (item.field === 'transformExpr' && item.selectData === 'DateFormatType') {
      return data
        .filter(entry => entry.context === "RCX-Format")
        .filter(entry => !formValues.format || entry.value !== formValues.format);
    }
    return data;
  };

  const sortData = (item: Field, data: any[] = []) => {
    if (data && data.length) {
      if (item.selectData === 'valueOptions') return [...data].sort();
      else
        return [...data].sort((a, b) =>
          a[item.selectLabel || 'name']?.localeCompare(b[item.selectLabel || 'name'])
        );
    }
    return data;
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>, element: Field) => {
    let value = event.target.value;

    if (element.type === 'number') {
      value = Number(value).toString();
    }
    
    if (element.regExp) {
      const regexPattern = RegExp(element.regExp);
      if (!regexPattern.test(value)) {
        value = '';
      }
    }
    
    handleChange(element.field, value);
    
    if (element.changeHandler && handlers[element.changeHandler]) {
      handlers[element.changeHandler]({ controls: { [element.field]: { value } } });
    }
  };

  const renderField = (item: Field) => {
    if (!displayConditionBased(item)) return null;

    const disabled = disableConditionBased(item);
    const value = formValues[item.field] !== undefined ? formValues[item.field] : '';
    const error = formTouched[item.field] && formErrors[item.field];
    const helperText = error ? getErrorMessage(item, error) : '';

    switch (item.type) {
      case 'text':
      case 'password':
        return (
          <TextField
            fullWidth
            label={!item.hideLabel ? item.label : ''}
            type={item.type}
            value={value}
            onChange={(e) => handleChange(item.field, e.target.value)}
            onBlur={() => handleBlur(item.field)}
            error={!!error}
            helperText={helperText}
            disabled={disabled}
            placeholder={item.placeHolder}
            required={shouldDisplayAsterisk(item)}
            autoFocus={item.autofocus}
            InputProps={{
              onFocus: (e) => item.selectAllOnClick && e.target.select()
            }}
          />
        );
        
      case 'number':
        return (
          <TextField
            fullWidth
            label={!item.hideLabel ? item.label : ''}
            type="number"
            value={value}
            onChange={(e) => onInputChange(e, item)}
            onBlur={() => handleBlur(item.field)}
            error={!!error}
            helperText={helperText}
            disabled={disabled}
            required={shouldDisplayAsterisk(item)}
          />
        );
        
      case 'select':
        return (
          <div className="flex items-center gap-4 w-full">
            <FormControl fullWidth error={!!error} disabled={disabled}>
              <InputLabel>{!item.hideLabel ? item.label : ''}</InputLabel>
              <Select
                value={value}
                onChange={(e) => {
                  handleChange(item.field, e.target.value);
                  if (item.selectionChange && handlers[item.selectionChange]) {
                    handlers[item.selectionChange]({ controls: { [item.field]: { value: e.target.value } } }, item);
                  }
                }}
                label={!item.hideLabel ? item.label : ''}
                required={shouldDisplayAsterisk(item)}
              >
                {sortData(item, filterDataByContext(requiredData[item.selectData], item)).map((option: any) => (
                  <MenuItem 
                    key={item.selectValue ? option[item.selectValue] : option}
                    value={item.selectValue ? option[item.selectValue] : option}
                    onClick={() => {
                      if (item.handleChange && handlers[item.handleChange]) {
                        handlers[item.handleChange](option, item);
                      }
                    }}
                  >
                    {item.selectLabel ? option[item.selectLabel] : option}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>{helperText}</FormHelperText>}
            </FormControl>
            
            {displayAddButton(item) && (
              <Button
                variant="contained"
                onClick={() => handleClick(item)}
                disabled={!showBasedOn(item.showBasedOn)}
                className="h-10 bg-blue-800 text-white"
                startIcon={<span className="material-icons">{item.iconName}</span>}
              >
                {handlers.buttonName ? handlers.buttonName() : 'Add'}
              </Button>
            )}
          </div>
        );
        
      case 'select-search':
        return (
          <FormControl fullWidth error={!!error} disabled={disabled}>
            <DropDownWithSearch
              label={!item.hideLabel ? item.label : ''}
              placeHolder={item.placeHolder || ''}
              placeHolderSearchBox={item.label || ''}
              selectedValue={value ? [value] : []}
              selectBoxOptions={requiredData[item.selectData] || []}
              valueChange={(options) => {
                handleChange(item.field, options.input[0]);
                if (item.selectionChange && handlers[item.selectionChange]) {
                  handlers[item.selectionChange]({ controls: { [item.field]: { value: options.input[0] } } }, item);
                }
              }}
            />
            {error && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        );
        
      case 'radio':
        return (
          <FormControl component="fieldset" error={!!error} disabled={disabled}>
            <RadioGroup
              value={value}
              onChange={(e) => {
                handleChange(item.field, e.target.value);
                if (item.selectionChange && handlers[item.selectionChange]) {
                  handlers[item.selectionChange]({ controls: { [item.field]: { value: e.target.value } } }, item);
                }
              }}
            >
              {item.value?.map((option: any) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio color="primary" />}
                  label={option.key}
                />
              ))}
            </RadioGroup>
            {error && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        );
        
      case 'button':
        return (
          <Button
            variant="contained"
            onClick={() => handleClick(item)}
            disabled={!showBasedOn(item.showBasedOn)}
            className="mt-5 bg-blue-800 text-white"
          >
            {item.field}
          </Button>
        );
        
      case 'inputSearch':
        return (
          <TextField
            fullWidth
            label={!item.hideLabel ? item.label : ''}
            value={value}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleClick(item)}>
                    <span className="material-icons">{item.icon}</span>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!error}
            helperText={helperText}
            disabled={disabled}
            required={shouldDisplayAsterisk(item)}
          />
        );
        
      case 'fileUpload':
        return (
          <TextField
            fullWidth
            label={!item.hideLabel ? item.label : ''}
            type="password"
            value={value || ''}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => document.getElementById(`file-upload-${item.field}`)?.click()}>
                    <span className="material-icons">upload</span>
                  </IconButton>
                </InputAdornment>
              ),
              onClick: () => document.getElementById(`file-upload-${item.field}`)?.click()
            }}
            error={!!error}
            helperText={helperText}
            disabled={disabled}
            required={shouldDisplayAsterisk(item)}
          />
        );
        
      case 'switch':
        return (
          <div className="flex items-center">
            {item.icon && <span className="material-icons mr-2">{item.icon}</span>}
            <span className="mr-2">{item.label}</span>
            <Switch
              checked={!!value}
              onChange={(e) => {
                handleChange(item.field, e.target.checked);
                if (item.toggle && handlers[item.toggle]) {
                  handlers[item.toggle](item);
                }
              }}
              color="primary"
              disabled={disabled}
            />
          </div>
        );
        
      case 'dateTime':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label={!item.hideLabel ? item.label : ''}
              value={value ? new Date(value) : null}
              onChange={(newValue) => {
                handleChange(item.field, newValue?.toISOString());
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!error,
                  helperText: helperText,
                  required: shouldDisplayAsterisk(item),
                  disabled: disabled
                }
              }}
            />
          </LocalizationProvider>
        );
        
      default:
        return null;
    }
  };

  const getErrorMessage = (item: Field, error: string): string => {
    switch (error) {
      case 'required':
        return `Please enter ${item.label.toLowerCase()}`;
      case 'minlength':
        return `Entered value cannot be less than ${item.minLength} characters length.`;
      case 'maxlength':
        return `Entered value cannot exceed ${item.maxLength} characters length.`;
      case 'pattern':
        return `Please enter valid ${item.label.toLowerCase()}.`;
      default:
        return '';
    }
  };

  return (
    <div className="form">
      {dataFields.map((dataField, index) => (
        <div key={index}>
          <div className="flex flex-wrap">
            {dataField.fields.map((item, fieldIndex) => (
              displayConditionBased(item) && (
                <div 
                  key={fieldIndex} 
                  className={item.class || 'w-1/2 px-4'}
                >
                  <div className="mb-4">
                    <div className="flex items-center mb-1">
                      {!item.hideLabel && (
                        <label className="text-sm font-medium text-gray-700">
                          {item.label}
                          {shouldDisplayAsterisk(item) && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                      )}
                      {item.labelicon && (
                        <Tooltip title={getTooltipText(item)}>
                          <IconButton size="small" onClick={() => handleClick(item)}>
                            <span className="material-icons text-sm">{item.iconName}</span>
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                    {renderField(item)}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DynamicForm;