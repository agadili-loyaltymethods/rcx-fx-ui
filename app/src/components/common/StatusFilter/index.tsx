import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

interface StatusFilterProps {
  statusFilter?: string;
  onFilterChange?: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  statusFilter = 'all',
  onFilterChange
}) => {
  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newStatus: string | null
  ) => {
    if (newStatus !== null && onFilterChange) {
      onFilterChange(newStatus);
    }
  };

  return (
    <div className="tab-wrap">
      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={handleFilterChange}
        aria-label="status filter"
        className="button-size"
      >
        <ToggleButton 
          value="all" 
          className="toggles border border-gray-300 text-gray-600 font-medium"
        >
          All
        </ToggleButton>
        <ToggleButton 
          value="Failed" 
          className="toggles border border-gray-300 text-gray-600 font-medium"
        >
          Failed
        </ToggleButton>
        <ToggleButton 
          value="Succeeded" 
          className="toggles border border-gray-300 text-gray-600 font-medium"
        >
          Succeeded
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default StatusFilter;