import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';

// Type definitions
interface TableColumn {
  name: string;
  label: string;
  type?: string;
  style?: string;
  applyStyleWith?: string;
  styleField?: string;
  routerLink?: string;
  clickHandler?: string;
  copy?: boolean;
  pipe?: string;
  subFieldPipe?: string;
  subField?: string;
  ellipsis?: boolean;
  ellipsisMaxLength?: number;
  toolTip?: any;
  showHostingPartner?: boolean;
  subdoc?: string;
  source?: string;
  stateProperty?: string;
  default?: string;
  valueFormat?: Record<string, string>;
  truncateFileName?: boolean;
  disable?: boolean;
  applyPipeCond?: {
    key: string;
    value: any;
  };
}

interface TableConfig {
  data: TableColumn[];
  actions?: {
    name: string;
    iconname: string;
    clickHandler?: string;
    toolTip?: string;
    dispCondField?: string | object;
    dispCondValue?: any;
    permissionCond?: any;
  }[];
  selectRow?: boolean;
  selectRowHandler?: string;
  commonProperties?: {
    ellipsisMaxLength?: number;
  };
}

interface DynamicTableProps {
  config: TableConfig;
  data: any[];
  handlers?: {
    [key: string]: (row?: any, index?: number) => void;
  };
  requiredData?: {
    selectedData?: any[];
    selectedRow?: any;
  };
  showPagination?: boolean;
  isView?: boolean;
  parentData?: any;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  config,
  data = [],
  handlers = {},
  requiredData = { selectedData: [], selectedRow: null },
  showPagination = true,
  isView = false
}) => {
  const [sortedData, setSortedData] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: config?.data ? config.data[0]?.name : '',
    direction: 'desc'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedData, setSelectedData] = useState<any[]>(requiredData.selectedData || []);

  // Initialize utility services
  const clipboardRef = useRef<any>(null);
  const alertRef = useRef<any>(null);

  // Mock services that would be implemented separately in a React app
  const utilsService = {
    checkPerms: (perm: string) => true, // This would need to check actual permissions
  };

  const pipeService = {
    pipes: {},
  };

  useEffect(() => {
    if (data) {
      let sortableData = [...data];
      if (sortConfig !== null) {
        sortableData.sort((a, b) => {
          const aValue = getNestedValue(a, sortConfig.key);
          const bValue = getNestedValue(b, sortConfig.key);
          
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      setSortedData(sortableData);
    }
  }, [data, sortConfig]);

  useEffect(() => {
    if (requiredData.selectedData) {
      setSelectedData(requiredData.selectedData);
      setMultiSelect(requiredData.selectedData.length === data.length);
    }
  }, [requiredData.selectedData, data]);

  // Helper functions
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Notify parent about sort change
    if (handlers.changeOrder) {
      handlers.changeOrder();
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const getColumn = (item: TableColumn): string => {
    return item.name;
  };

  const getClassName = (item: TableColumn, element: any): string => {
    let style = '';
    
    if (item && item.style) {
      style += ' ' + item.style;
    }
    
    if (item && item.applyStyleWith && item.styleField && element[item.styleField]) {
      style += ' ' + `${item.applyStyleWith}-${element[item.styleField].toLowerCase().split(' ').join('')}`;
    }
    
    return style;
  };

  const displayConditionBased = (action: any, element: any): boolean => {
    let permissionCondRes = true;
    
    if (action.permissionCond) {
      permissionCondRes = utilsService.checkPerms(action.permissionCond);
    }
    
    if (!permissionCondRes) {
      return false;
    }
    
    if (action.dispCondField) {
      if (typeof action.dispCondField === 'object') {
        return Object.keys(action.dispCondField).every((key) => {
          const value = _.get(element, key);
          
          if (typeof action.dispCondValue[key] === 'object') {
            if (action.dispCondValue[key].nin) {
              return !action.dispCondValue[key].nin.includes(value);
            }
            if (action.dispCondValue[key].in) {
              return action.dispCondValue[key].in.includes(value);
            }
          }
          
          return value === action.dispCondValue[key];
        });
      } else {
        const value = _.get(element, action.dispCondField);
        return value === action.dispCondValue;
      }
    }
    
    return true;
  };

  const onRowClick = (element: any, item: TableColumn) => {
    if (!item.routerLink && !item.clickHandler) {
      return;
    }
    
    if (item.clickHandler && handlers[item.clickHandler]) {
      return handlers[item.clickHandler](element);
    }
    
    if (item.subdoc) {
      element = element[item.subdoc];
    }
    
    // In a real implementation, this would use React Router's navigation
    if (handlers.navigate) {
      if (item.stateProperty) {
        handlers.navigate(`${item.routerLink}/${element._id}`, { 
          state: { [item.stateProperty]: element, source: item.source } 
        });
      } else {
        handlers.navigate(`${item.routerLink}/${element._id}`, { 
          state: { element, source: item.source } 
        });
      }
    }
  };

  const actionHandler = (event: React.MouseEvent, action: any, data: any, index: number) => {
    event.stopPropagation();
    const handler = action.clickHandler;
    if (handler && handlers && typeof handlers[handler] === 'function') {
      return handlers[handler](data, index);
    }
  };

  const copyToClipboard = (event: React.MouseEvent, text: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(text);
    // Show success notification
    if (handlers.showAlert) {
      handlers.showAlert('success', text + ' copied to clipboard');
    }
  };

  const returnFileName = (value: string): string => {
    if (!value) return '';
    return `${value.substring(0, 9)}..${value.substring(value.length - 12)}`;
  };

  const getFieldValue = (element: any, property: TableColumn, isSubField = false): string => {
    let value = property.default || '';
    
    if (isSubField && property.subField) {
      value = getNestedValue(element, property.subField) || property.default || '';
    } else {
      value = getNestedValue(element, property.name) || property.default || '';
    }
    
    if (property.valueFormat && value !== undefined) {
      value = property.valueFormat['' + value] || value;
    }
    
    if (!value) {
      value = property.default || '';
    }

    // Apply pipes if defined and available
    if (value !== property.default && 
        (property.pipe || (isSubField && property.subFieldPipe)) && 
        pipeService.pipes) {
      
      if (property.applyPipeCond) {
        if (element[property.applyPipeCond.key] === property.applyPipeCond.value) {
          const pipeName = isSubField ? property.subFieldPipe : property.pipe;
          if (pipeName && pipeService.pipes[pipeName]) {
            value = pipeService.pipes[pipeName](value);
          }
        }
      } else {
        const pipeName = isSubField ? property.subFieldPipe : property.pipe;
        if (pipeName && pipeService.pipes[pipeName]) {
          value = pipeService.pipes[pipeName](value);
        }
      }
    }
    
    if (property.truncateFileName && typeof value === 'string') {
      value = returnFileName(value);
    }
    
    return value?.toString() || '';
  };

  const formatLabel = (totalMinutes: number): string => {
    if (totalMinutes) {
      if (totalMinutes > 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} hr ${minutes} min`;
      } else {
        return totalMinutes === 60 ? `${totalMinutes} hr` : `${totalMinutes} min`;
      }
    } else {
      return '';
    }
  };

  const toggleSelection = (item: any) => {
    const itemIndex = selectedData.findIndex(selectedItem => selectedItem === item);
    
    if (itemIndex === -1) {
      const newSelectedData = [...selectedData, item];
      setSelectedData(newSelectedData);
      if (requiredData) {
        requiredData.selectedData = newSelectedData;
      }
    } else {
      const newSelectedData = [...selectedData];
      newSelectedData.splice(itemIndex, 1);
      setSelectedData(newSelectedData);
      if (requiredData) {
        requiredData.selectedData = newSelectedData;
      }
    }
  };

  const multipleToggleSelection = () => {
    const newMultiSelect = !multiSelect;
    setMultiSelect(newMultiSelect);
    
    if (newMultiSelect) {
      setSelectedData([...data]);
      if (requiredData) {
        requiredData.selectedData = [...data];
      }
    } else {
      setSelectedData([]);
      if (requiredData) {
        requiredData.selectedData = [];
      }
    }
  };

  const isSelected = (item: any): boolean => {
    const selected = selectedData.includes(item);
    
    // Update multiSelect state if all rows are selected or not
    if (selectedData.length !== data.length) {
      if (multiSelect) setMultiSelect(false);
    } else {
      if (!multiSelect) setMultiSelect(true);
    }
    
    return selected;
  };

  const isSelectedRow = (item: any): boolean => {
    return requiredData?.selectedRow && item && requiredData.selectedRow._id === item._id;
  };

  const selectRow = (row: any) => {
    if (!config.selectRow) {
      return;
    }
    
    if (requiredData) {
      requiredData.selectedRow = row;
    }
    
    if (config.selectRowHandler && handlers[config.selectRowHandler]) {
      handlers[config.selectRowHandler]();
    }
  };

  // Get column definitions
  const primaryColumns = config.data ? config.data.map(item => getColumn(item)) : [];
  
  // Apply pagination
  const paginatedData = showPagination 
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
    : sortedData;

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {config.data && config.data.map((item, index) => (
                <th 
                  key={index} 
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b"
                >
                  {item.label === 'Select' ? (
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      checked={multiSelect}
                      onChange={multipleToggleSelection}
                    />
                  ) : (
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => requestSort(item.name)}
                    >
                      <span>{item.label}</span>
                      <span className="ml-1">
                        {sortConfig?.key === item.name ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : ''}
                      </span>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((element, rowIndex) => (
                <tr 
                  key={rowIndex}
                  onClick={() => selectRow(element)}
                  className={`
                    ${isSelectedRow(element) ? 'bg-blue-50' : 'bg-white'} 
                    hover:bg-gray-50 transition-colors border-b
                    ${element.isHostingPartner ? 'border-l-4 border-blue-600' : ''}
                  `}
                >
                  {config.data.map((item, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-4 py-3 text-sm text-gray-600"
                    >
                      {item.type === 'nameWithTS' && (
                        <div>
                          <div>{getFieldValue(element, item)}</div>
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={getClassName(item, element)}>
                              {getFieldValue(element, item, true)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {item.type === 'actions' && (
                        <div className="flex items-center space-x-1">
                          {config.actions?.map((action, actionIndex) => (
                            displayConditionBased(action, element) && !isView && (
                              <button
                                key={actionIndex}
                                disabled={!displayConditionBased(action, element) || isView}
                                onClick={(e) => actionHandler(e, action, element, rowIndex)}
                                title={action.toolTip || action.iconname}
                                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30"
                              >
                                <span className="material-icons text-gray-600 text-lg">{action.iconname}</span>
                              </button>
                            )
                          ))}
                        </div>
                      )}
                      
                      {item.type === 'select' && (
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600"
                          checked={isSelected(element)}
                          onChange={() => toggleSelection(element)}
                        />
                      )}
                      
                      {item.type === 'fieldSelect' && (
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600"
                          disabled={item.disable}
                          checked={!!getFieldValue(element, item, false)}
                          readOnly
                        />
                      )}
                      
                      {item.type === 'boolean' && (
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600"
                          checked={getFieldValue(element, item) === 'true'}
                          disabled
                          readOnly
                        />
                      )}
                      
                      {!['actions', 'nameWithTS', 'boolean', 'fieldSelect', 'select'].includes(item.type || '') && (
                        <div 
                          onClick={() => onRowClick(element, item)}
                          className={`${getClassName(item, element)} ${item.clickHandler || item.routerLink ? 'cursor-pointer' : ''}`}
                          title={item.toolTip && getFieldValue(element, item) === item.toolTip.value && getFieldValue(element, item, true)}
                        >
                          <div className={item.ellipsis ? "truncate max-w-xs" : ""}>
                            {getFieldValue(element, item)}
                          </div>
                          
                          {element.isHostingPartner && item.showHostingPartner && (
                            <div className="text-xs text-gray-500 mt-1">(Hosting Partner)</div>
                          )}
                          
                          {item.copy === true && getFieldValue(element, item) !== item.default && (
                            <button
                              className="ml-1 p-1 text-gray-400 hover:text-gray-600"
                              onClick={(e) => copyToClipboard(e, getFieldValue(element, item))}
                              title="Copy to clipboard"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={primaryColumns.length} 
                  className="px-4 py-8 text-center text-sm italic text-gray-500"
                >
                  No results found!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {showPagination && data.length > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-3 bg-white">
          <div className="flex items-center">
            <select
              className="form-select border rounded px-2 py-1 text-sm"
              value={rowsPerPage}
              onChange={(e) => handleChangeRowsPerPage(parseInt(e.target.value))}
            >
              {[5, 10, 20].map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="text-sm">
              Page {page + 1} of {Math.ceil(sortedData.length / rowsPerPage)}
            </span>
            
            <button
              onClick={() => handleChangePage(page + 1)}
              disabled={page >= Math.ceil(sortedData.length / rowsPerPage) - 1}
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;