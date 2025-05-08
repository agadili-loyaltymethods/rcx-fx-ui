import React, { useState, useEffect, useRef } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText, 
  TextField,
  Tooltip
} from '@mui/material';

interface Option {
  id: string;
  name: string;
}

interface DropDownWithSearchProps {
  placeHolder?: string;
  label?: string;
  placeHolderSearchBox?: string;
  selectedValue?: Option[];
  selectBoxOptions?: Option[];
  callBack?: Function;
  multiple?: boolean;
  fieldName?: string;
  valueChange?: (options: { input: Option[]; fieldName?: string }) => void;
}

const DropDownWithSearch: React.FC<DropDownWithSearchProps> = ({
  placeHolder = 'Select Value',
  label = '',
  placeHolderSearchBox = 'Select Value',
  selectedValue = [],
  selectBoxOptions = [],
  callBack,
  multiple = false,
  fieldName,
  valueChange
}) => {
  const [selectCtrl, setSelectCtrl] = useState<Option[]>(selectedValue || []);
  const [selectFilterCtrl, setSelectFilterCtrl] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [ellipsisData, setEllipsisData] = useState('');

  // Initialize filtered options
  useEffect(() => {
    setFilteredOptions(selectBoxOptions?.sort((a, b) => a.name.localeCompare(b.name)) || []);
  }, [selectBoxOptions]);

  // Update selected values when prop changes
  useEffect(() => {
    setSelectCtrl(selectedValue || []);
  }, [selectedValue]);

  // Filter options based on search term
  useEffect(() => {
    if (!selectBoxOptions) return;
    
    const filtered = selectFilterCtrl
      ? selectBoxOptions.filter(option => 
          option.name.toLowerCase().includes(selectFilterCtrl.toLowerCase())
        )
      : selectBoxOptions;
    
    setFilteredOptions(filtered.sort((a, b) => a.name.localeCompare(b.name)));
    setToggleAllCheckboxState();
  }, [selectFilterCtrl, selectBoxOptions]);

  // Update toggle all checkbox state
  useEffect(() => {
    setToggleAllCheckboxState();
  }, [selectCtrl]);

  const setToggleAllCheckboxState = () => {
    if (!selectCtrl || !filteredOptions.length) {
      setIsChecked(false);
      setIsIndeterminate(false);
      return;
    }

    const ellipsisText = selectCtrl.map(item => item.name).join(', ');
    setEllipsisData(ellipsisText);

    let filteredLength = 0;
    const optionsSelected = filteredOptions.length ? filteredOptions : selectBoxOptions;

    optionsSelected?.forEach(el => {
      selectCtrl.forEach(element => {
        if (el.name === element.name) {
          filteredLength++;
        }
      });
    });

    setIsChecked(filteredLength > 0 && filteredLength === optionsSelected.length);
    setIsIndeterminate(filteredLength > 0 && filteredLength < optionsSelected.length);
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as Option[];
    setSelectCtrl(value);
    onInputValueChange();
  };

  const toggleSelectAll = (selectAllValue: boolean) => {
    if (selectAllValue) {
      setSelectCtrl([...filteredOptions]);
    } else {
      setSelectCtrl([]);
    }
    onInputValueChange();
  };

  const onInputValueChange = () => {
    const options = {
      input: selectCtrl || '',
      fieldName
    };
    
    if (valueChange) {
      valueChange(options);
    }
  };

  const calculateEllipsisMaxLength = (): number | null => {
    if (selectCtrl.length > 1 && selectCtrl.length !== selectBoxOptions.length) {
      return 20; // multiSelectedMaxLength
    }
    if (selectCtrl.length === 1) {
      return 30; // singleSelectedMaxLength
    }
    return null;
  };

  const getEllipsisData = (): string => {
    if (selectCtrl.length === selectBoxOptions.length) {
      return 'All Selected';
    } else {
      return ellipsisData;
    }
  };

  const renderValue = (selected: Option[]) => {
    if (selected.length === 0) {
      return <span>{placeHolder}</span>;
    }

    const maxLength = calculateEllipsisMaxLength();
    let displayText = selected[0].name;
    
    if (selected.length > 1) {
      if (selected.length === selectBoxOptions.length) {
        displayText = 'All Selected';
      } else if (maxLength && ellipsisData.length > maxLength) {
        displayText = `${selected[0].name} (+${selected.length - 1} ${selected.length === 2 ? 'other' : 'others'})`;
      } else {
        displayText = `${selected[0].name} (+${selected.length - 1} ${selected.length === 2 ? 'other' : 'others'})`;
      }
    }

    return (
      <Tooltip title={getEllipsisData()} placement="top" arrow>
        <span className="truncate">{displayText}</span>
      </Tooltip>
    );
  };

  return (
    <FormControl variant="outlined" fullWidth className="mb-4">
      {label && <InputLabel>{label}</InputLabel>}
      
      <Select
        multiple={multiple}
        value={selectCtrl}
        onChange={handleChange}
        renderValue={multiple ? (selected) => renderValue(selected as Option[]) : undefined}
        placeholder={placeHolder}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        ref={selectRef}
        label={label}
      >
        {isOpen && (
          <MenuItem disabled>
            <div className="p-2 w-full">
              <TextField
                fullWidth
                variant="outlined"
                placeholder={placeHolderSearchBox}
                value={selectFilterCtrl}
                onChange={(e) => setSelectFilterCtrl(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                size="small"
              />
              {multiple && (
                <div className="flex items-center mt-2">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isChecked}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                  <span>Select All</span>
                </div>
              )}
            </div>
          </MenuItem>
        )}
        
        {filteredOptions.map((option) => (
          <MenuItem key={option.id} value={option}>
            {multiple && (
              <Checkbox checked={selectCtrl.some(item => item.id === option.id)} />
            )}
            <Tooltip title={option.name} placement="top" arrow>
              <ListItemText 
                primary={option.name} 
                className="truncate max-w-xs"
              />
            </Tooltip>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DropDownWithSearch;