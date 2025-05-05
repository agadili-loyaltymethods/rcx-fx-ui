import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Checkbox, 
  IconButton, 
  Tooltip,
  TableSortLabel,
  TablePagination
} from '@mui/material';
import _ from 'lodash';

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
  ellipsis?: boolean;
  ellipsisMaxLength?: number;
  toolTip?: any;
  showHostingPartner?: boolean;
  subdoc?: string;
  source?: string;
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
    [key: string]: (row: any, index?: number) => void;
  };
  requiredData?: {
    selectedData?: any[];
    selectedRow?: any;
  };
  showPagination?: boolean;
  isView?: boolean;
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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedData, setSelectedData] = useState<any[]>(requiredData.selectedData || []);

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

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    if (handlers.changeOrder) {
      handlers.changeOrder();
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
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
    
    if (item && item.applyStyleWith) {
      style += ' ' + `${item.applyStyleWith}-${element[item.styleField]?.toLowerCase().split(' ').join('')}`;
    }
    
    return style;
  };

  const displayConditionBased = (action: any, element: any): boolean => {
    let permissionCondRes = true;
    
    if (action.permissionCond) {
      // This would need to be implemented based on your permission checking logic
      // permissionCondRes = checkPerms(action.permissionCond);
    }
    
    if (!permissionCondRes) {
      return false;
    }
    
    if (action.dispCondField) {
      if (typeof action.dispCondField === 'object') {
        return Object.keys(action.dispCondField).every(element => {
          const value = _.get(element, element);
          
          if (typeof action.dispCondValue[element] === 'object') {
            if (action.dispCondValue[element].nin) {
              return !action.dispCondValue[element].nin.includes(value);
            }
            if (action.dispCondValue[element].in) {
              return action.dispCondValue[element].in.includes(value);
            }
          }
          
          return value === action.dispCondValue[element];
        });
      } else {
        const value = _.get(element, action.dispCondField);
        return value === action.dispCondValue;
      }
    }
    
    return true;
  };

  const onRowClick = (element: any, item: TableColumn) => {
    if (item.routerLink && handlers.onRowClick) {
      handlers.onRowClick(element, item);
    } else if (item.clickHandler && handlers[item.clickHandler]) {
      handlers[item.clickHandler](element);
    }
  };

  const actionHandler = (event: React.MouseEvent, action: any, data: any, index: number) => {
    event.stopPropagation();
    if (action.clickHandler && handlers[action.clickHandler]) {
      return handlers[action.clickHandler](data, index);
    }
  };

  const copyToClipboard = (event: React.MouseEvent, text: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(text);
    // You would typically show a notification here
  };

  const getFieldValue = (element: any, property: TableColumn, isSubField = false): string => {
    let value = property.default || '';
    
    if (isSubField && property.subField) {
      value = getNestedValue(element, property.subField) || property.default || '';
    } else {
      value = getNestedValue(element, property.name) || property.default || '';
    }
    
    // This would need to be implemented based on your pipe service
    // if (property.pipe || (isSubField && property.subFieldPipe)) {
    //   value = pipeService.pipes[isSubField ? property.subFieldPipe : property.pipe](value);
    // }
    
    return value;
  };

  const toggleSelection = (item: any) => {
    const itemIndex = selectedData.findIndex(selectedItem => selectedItem === item);
    
    if (itemIndex === -1) {
      const newSelectedData = [...selectedData, item];
      setSelectedData(newSelectedData);
      if (requiredData.selectedData) {
        requiredData.selectedData = newSelectedData;
      }
    } else {
      const newSelectedData = [...selectedData];
      newSelectedData.splice(itemIndex, 1);
      setSelectedData(newSelectedData);
      if (requiredData.selectedData) {
        requiredData.selectedData = newSelectedData;
      }
    }
  };

  const multipleToggleSelection = () => {
    const newMultiSelect = !multiSelect;
    setMultiSelect(newMultiSelect);
    
    if (newMultiSelect) {
      setSelectedData([...data]);
      if (requiredData.selectedData) {
        requiredData.selectedData = [...data];
      }
    } else {
      setSelectedData([]);
      if (requiredData.selectedData) {
        requiredData.selectedData = [];
      }
    }
  };

  const isSelected = (item: any): boolean => {
    if (selectedData.length !== data.length) {
      setMultiSelect(false);
    } else {
      setMultiSelect(true);
    }
    return selectedData.includes(item);
  };

  const isSelectedRow = (item: any): boolean => {
    return requiredData.selectedRow && item && requiredData.selectedRow._id === item._id;
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

  const primaryColumns = config.data.map(item => getColumn(item));
  const paginatedData = showPagination 
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
    : sortedData;

  return (
    <div className="responsive-table">
      <TableContainer component={Paper} className="border border-gray-200 rounded">
        <Table className="custom-table">
          <TableHead>
            <TableRow>
              {config.data.map((item, index) => {
                if (item.label === 'Actions' || item.label === 'Select') {
                  if (item.label === 'Actions') {
                    return (
                      <TableCell key={index} className="font-semibold">
                        {item.label}
                      </TableCell>
                    );
                  } else { // Select
                    return (
                      <TableCell key={index} className="font-semibold">
                        <Checkbox
                          checked={multiSelect}
                          onChange={() => multipleToggleSelection()}
                        />
                      </TableCell>
                    );
                  }
                } else {
                  return (
                    <TableCell 
                      key={index} 
                      className="font-semibold"
                      sortDirection={sortConfig?.key === item.name ? sortConfig.direction : false}
                    >
                      <TableSortLabel
                        active={sortConfig?.key === item.name}
                        direction={sortConfig?.key === item.name ? sortConfig.direction : 'asc'}
                        onClick={() => requestSort(item.name)}
                      >
                        {item.label}
                      </TableSortLabel>
                    </TableCell>
                  );
                }
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((element, rowIndex) => (
              <TableRow 
                key={rowIndex}
                onClick={() => selectRow(element)}
                className={`${isSelectedRow(element) ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-gray-50'} ${element.isHostingPartner ? 'border-l-4 border-blue-600' : ''}`}
              >
                {config.data.map((item, colIndex) => (
                  <TableCell key={colIndex}>
                    {item.type === 'nameWithTS' && (
                      <div>
                        {getFieldValue(element, item)}
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="material-icons text-sm mr-1">schedule</span>
                          <span className={getClassName(item, element)}>
                            {getFieldValue(element, item, true)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {item.type === 'actions' && (
                      <div className="flex items-center">
                        {config.actions?.map((action, actionIndex) => (
                          displayConditionBased(action, element) && !isView && (
                            <Tooltip key={actionIndex} title={action.toolTip || action.iconname}>
                              <IconButton
                                disabled={!displayConditionBased(action, element) || isView}
                                onClick={(e) => actionHandler(e, action, element, rowIndex)}
                              >
                                <span className="material-icons">{action.iconname}</span>
                              </IconButton>
                            </Tooltip>
                          )
                        ))}
                      </div>
                    )}
                    
                    {item.type === 'select' && (
                      <Checkbox
                        checked={isSelected(element)}
                        onChange={() => toggleSelection(element)}
                      />
                    )}
                    
                    {item.type === 'fieldSelect' && (
                      <Checkbox
                        disabled={item.disable}
                        checked={!!getFieldValue(element, item, false)}
                      />
                    )}
                    
                    {item.type === 'boolean' && (
                      <Checkbox
                        checked={getFieldValue(element, item) === 'true'}
                        disabled
                      />
                    )}
                    
                    {!['actions', 'nameWithTS', 'boolean', 'fieldSelect', 'select'].includes(item.type || '') && (
                      <Tooltip 
                        title={item.toolTip && getFieldValue(element, item) === item.toolTip.value && getFieldValue(element, item, true) !== item.default && getFieldValue(element, item, true) || ''}
                      >
                        <div 
                          onClick={() => onRowClick(element, item)}
                          className={`${getClassName(item, element)} ${item.routerLink ? 'cursor-pointer' : ''} truncate max-w-xs`}
                        >
                          {getFieldValue(element, item)}
                          {element.isHostingPartner && item.showHostingPartner && (
                            <span className="block text-xs text-gray-500">(Hosting Partner)</span>
                          )}
                          {item.copy === true && getFieldValue(element, item) !== item.default && (
                            <IconButton
                              size="small"
                              onClick={(e) => copyToClipboard(e, getFieldValue(element, item))}
                              className="ml-1"
                            >
                              <span className="material-icons text-sm">content_copy</span>
                            </IconButton>
                          )}
                        </div>
                      </Tooltip>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {data && !data.length && (
        <div className="text-center text-sm italic my-8">
          No results found!
        </div>
      )}
      
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </div>
  );
};

export default DynamicTable;