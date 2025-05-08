import React, { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface GlobalTableSearchProps {
  searchPlaceHolder?: string;
  widthClass?: string;
  inputValueChange?: (value: string) => void;
  searchValueChange?: (value: { input: string }) => void;
}

const GlobalTableSearch: React.FC<GlobalTableSearchProps> = ({
  searchPlaceHolder = 'Search By Name',
  widthClass = 'w-64',
  inputValueChange,
  searchValueChange
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    if (inputValueChange) {
      inputValueChange(newValue);
    }
  };

  const handleBlur = () => {
    if (searchValueChange) {
      searchValueChange({ input: inputValue });
    }
  };

  return (
    <TextField
      className={widthClass}
      placeholder={searchPlaceHolder}
      variant="outlined"
      fullWidth
      size="small"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon className="text-gray-400" />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default GlobalTableSearch;