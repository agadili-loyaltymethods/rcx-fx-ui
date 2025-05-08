import React, { useState, useEffect } from 'react';
import { 
  Button,
  TextField,
  InputAdornment,
  FormControl
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import StatusFilter from '../StatusFilter/StatusFilter';
import DropDownWithSearch from '../DropDownWithSearch/DropDownWithSearch';

interface TableFilterProps {
  config: any;
  handlers?: any;
  tableData?: any[];
  searchValue?: string;
  startDate?: string | null;
  endDate?: string | null;
  statusFilter?: string;
  pageName?: string;
  filterChange?: (options: any) => void;
  startTimeChange?: (date: string | null) => void;
  endTimeChange?: (date: string | null) => void;
  statusChange?: (status: string) => void;
  inputChange?: (value: string) => void;
  searchValueChange?: (options: { input: string }) => void;
}

const TableFilter: React.FC<TableFilterProps> = ({
  config,
  handlers = {},
  tableData = [],
  searchValue = '',
  startDate = null,
  endDate = null,
  statusFilter = 'all',
  pageName = '',
  filterChange,
  startTimeChange,
  endTimeChange,
  statusChange,
  inputChange,
  searchValueChange
}) => {
  const [cfgOpt, setCfgOpt] = useState<any>({});
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [refresh, setRefresh] = useState(false);
  const [inputFieldValue, setInputFieldValue] = useState<any[]>([]);

  useEffect(() => {
    if (config?.filterOptions) {
      setCfgOpt(config.filterOptions);
    }
    
    setRefresh(config?.refresh ?? false);
    
    // Initialize date range if provided
    if (startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;
      setRange([start, end]);
    }
  }, [config, startDate, endDate]);

  const getRefreshData = () => {
    if (handlers && typeof handlers.getRefresh === 'function') {
      handlers.getRefresh();
    }
  };

  const onStartDateChange = (date: Date | null) => {
    if (startTimeChange) {
      const formattedDate = date ? formatDate(date, 'start') : null;
      startTimeChange(formattedDate);
    }
  };

  const onEndDateChange = (date: Date | null) => {
    if (endTimeChange) {
      const formattedDate = date ? formatDate(date, 'end') : null;
      endTimeChange(formattedDate);
    }
  };

  const formatDate = (date: Date, type: 'start' | 'end'): string => {
    if (!date) return '';
    
    // Clone the date to avoid modifying the original
    const newDate = new Date(date);
    
    // Set to start or end of day
    if (type === 'start') {
      newDate.setHours(0, 0, 0, 0);
    } else {
      newDate.setHours(23, 59, 59, 999);
    }
    
    return newDate.toISOString();
  };

  const onStatusChange = (status: string) => {
    if (statusChange) {
      statusChange(status);
    }
  };

  const onChange = (options: any, field?: string) => {
    if (filterChange) {
      filterChange(options);
    }
  };

  const onInputValueChange = (value: string) => {
    if (inputChange) {
      inputChange(value);
    }
  };

  const onSearchValueChange = (options: { input: string }) => {
    if (searchValueChange) {
      searchValueChange(options);
    }
  };

  const resetFilters = () => {
    setRange([null, null]);
    
    if (statusChange) statusChange('all');
    if (startTimeChange) startTimeChange(null);
    if (endTimeChange) endTimeChange(null);
    if (searchValueChange) searchValueChange({ input: '' });
    if (filterChange) filterChange({ input: [], fieldName: '' });
    
    setInputFieldValue([]);
  };

  const getSelectedValue = (list: any[] = [], fieldName: string) => {
    const filters = config.filters?.[fieldName] || [];
    return list.filter(l => filters.includes(l.name));
  };

  // Helper function to maintain original order
  const originalOrder = () => 0;

  return (
    <div className="table-filter-section">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <StatusFilter 
          statusFilter={statusFilter} 
          onFilterChange={onStatusChange} 
        />
        
        <div className="flex items-center">
          <TextField
            placeholder="Search by Integration Name or Run Id"
            variant="outlined"
            size="small"
            value={searchValue}
            onChange={(e) => onSearchValueChange({ input: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="w-80"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
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
              valueChange={(options) => onChange(options, value.field)}
            />
          ))}
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
              localeText={{ start: 'Start date', end: 'End date' }}
              value={range}
              onChange={(newValue) => {
                setRange(newValue);
                onStartDateChange(newValue[0]);
                onEndDateChange(newValue[1]);
              }}
              slotProps={{
                textField: { size: 'small', fullWidth: true },
                fieldSeparator: { children: 'to' },
              }}
            />
          </LocalizationProvider>
        </div>
        
        <div className="flex gap-2">
          {refresh && (
            <Button
              variant="outlined"
              onClick={getRefreshData}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          )}
          
          <Button
            variant="outlined"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableFilter;