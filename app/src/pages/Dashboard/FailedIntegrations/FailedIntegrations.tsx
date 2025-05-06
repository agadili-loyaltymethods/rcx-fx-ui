import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './FailedIntegrations.css';

// Types for our data structure
interface IntegrationData {
  run_id: string;
  integration_name: string;
  status: string;
  start: { date: string; hours: string };
  end: { date: string; hours: string };
  duration: string;
  [key: string]: any;
}

// Sort configuration types
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | '';
}

const FailedIntegrations: React.FC = () => {
  // Mock data - in a real app this would likely come from an API
  const initialData: IntegrationData[] = [
    {
      run_id: '1234123',
      integration_name: 'Integration 012',
      status: 'Failed',
      start: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
      end: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
      duration: '1 Min',
    },
    {
      run_id: '34342',
      integration_name: 'Delta Integration',
      status: 'Failed',
      start: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
      end: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
      duration: '20 Min',
    },
    {
      run_id: '35343',
      integration_name: 'Walmart + Integration',
      status: 'Failed',
      start: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
      end: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
      duration: '1h 30min',
    },
    {
      run_id: '343',
      integration_name: 'Integration 1234',
      status: 'Failed',
      start: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
      end: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
      duration: '1h 30min',
    },
  ];

  // State for our data and sorting
  const [data, setData] = useState<IntegrationData[]>(initialData);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'run_id',
    direction: 'desc',
  });
  
  // For accessibility announcements
  const liveRegionRef = useRef<HTMLDivElement>(null);
  
  // For navigation (equivalent to Angular Router)
  const navigate = useNavigate();

  // Column configuration
  const displayedColumns: string[] = [
    'run_id',
    'integration_name',
    'status',
    'start',
    'end',
    'duration',
  ];

  // Sort the data when sortConfig changes
  useEffect(() => {
    const sortedData = [...initialData].sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      // Handle nested objects like start and end
      if (sortConfig.key === 'start' || sortConfig.key === 'end') {
        const aValue = a[sortConfig.key].date + a[sortConfig.key].hours;
        const bValue = b[sortConfig.key].date + b[sortConfig.key].hours;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle regular fields
      const aValue = a[sortConfig.key as keyof IntegrationData];
      const bValue = b[sortConfig.key as keyof IntegrationData];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setData(sortedData);
  }, [sortConfig]);

  // Announce sort changes for screen readers
  const announceSortChange = (sortDirection: string) => {
    if (liveRegionRef.current) {
      if (sortDirection) {
        liveRegionRef.current.textContent = `Sorted ${sortDirection}ending`;
      } else {
        liveRegionRef.current.textContent = 'Sorting cleared';
      }
    }
  };

  // Handle sort request
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | '' = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = '';
      }
    }
    
    setSortConfig({ key, direction });
    announceSortChange(direction);
  };

  // Navigation methods
  const showDetail = () => {
    navigate('/partners/detail');
  };

  const edit = () => {
    navigate('/partners/create');
  };

  const deleteItem = () => {
    // Implementation for delete functionality would go here
    console.log('Delete action triggered');
  };

  // Helper methods
  const getClassName = (status: string) => {
    return `status-${status.toLowerCase()}`;
  };

  const getHeaderName = (input: string) => {
    if (input.includes('_')) {
      const [first, second] = input.split('_');
      const firstString = first.charAt(0).toUpperCase() + first.slice(1);
      const secondString = second.charAt(0).toUpperCase() + second.slice(1);
      return `${firstString} ${secondString}`;
    } else {
      return `${input.charAt(0).toUpperCase() + input.slice(1)}`;
    }
  };

  // Render the sort indicator
  const getSortDirectionIcon = (columnName: string) => {
    if (sortConfig.key !== columnName) return null;
    
    return (
      <span className="sort-icon">
        {sortConfig.direction === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <>
      {/* Accessibility live region for announcing sort changes */}
      <div 
        ref={liveRegionRef} 
        aria-live="polite" 
        className="sr-only"
      />

      <div className="responsive-table vertical-scroll">
        <table className="row custom-table">
          <thead>
            <tr>
              {displayedColumns.map((column) => (
                <th 
                  key={column} 
                  className="table-header"
                  onClick={() => requestSort(column)}
                >
                  {getHeaderName(column)} {getSortDirectionIcon(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((element, index) => (
              <tr key={index}>
                {displayedColumns.map((column) => (
                  <td key={`${index}-${column}`} className="table-row">
                    {column === 'run_id' ? (
                      <a onClick={showDetail} className="name-color">
                        {element[column]}
                      </a>
                    ) : column === 'status' ? (
                      <div className={`status ${getClassName(element[column])}`}>
                        {element[column]}
                      </div>
                    ) : column === 'start' || column === 'end' ? (
                      <>
                        {element[column].date}
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <div>{element[column].hours}</div>
                        </div>
                      </>
                    ) : (
                      element[column]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default FailedIntegrations;