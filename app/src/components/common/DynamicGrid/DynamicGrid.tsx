import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Tooltip,
  Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';

interface GridField {
  name: string;
  label: string;
  className?: string;
  ellipsis?: boolean;
  displayType?: string;
  default?: string;
  time?: string;
  style?: string;
  applyStyleWith?: string;
  styleField?: string;
}

interface GridSection {
  section: string;
  fields: GridField[];
  singleRow?: boolean;
}

interface GridConfig {
  data: GridSection[];
  actions: {
    name: string;
    iconname: string;
    clickHandler?: string;
    dispCondField?: string | object;
    dispCondValue?: any;
    permissionCond?: any;
    toolTip?: string;
  }[];
  paginationOptions?: {
    pageSize: number;
    pageSizeOptions: number[];
  };
  commonProperties?: {
    ellipsisMaxLength?: number;
    gridViewEllipses?: number;
  };
}

interface DynamicGridProps {
  config: GridConfig;
  data: any[];
  handler: {
    [key: string]: (row: any) => void;
  };
}

const DynamicGrid: React.FC<DynamicGridProps> = ({ config, data, handler }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageData, setCurrentPageData] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  useEffect(() => {
    if (data && config?.paginationOptions?.pageSize) {
      const pageSize = config.paginationOptions.pageSize;
      setCurrentPageData(data.slice(0, pageSize));
    } else if (data) {
      setCurrentPageData(data);
    }
  }, [data, config]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleActionClick = (action: any) => {
    if (selectedRow && action.clickHandler && handler[action.clickHandler]) {
      handler[action.clickHandler](selectedRow);
    }
    handleMenuClose();
  };

  const getStatusClass = (status: string): string => {
    const normalizedStatus = (status || 'published').toLowerCase().replace(/\s+/g, '');
    return `border rounded px-2 py-1 text-xs font-medium ${getStatusColorClass(normalizedStatus)}`;
  };

  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'revision':
      case 'publishpending':
      case 'failed':
      case 'publishfailed':
        return 'border-amber-600 text-amber-900 bg-amber-50';
      case 'paused':
      case 'processing':
        return 'border-blue-600 text-blue-900 bg-blue-50';
      case 'published':
      case 'succeeded':
        return 'border-green-600 text-green-900 bg-green-50';
      default:
        return 'border-gray-300 text-gray-700 bg-gray-50';
    }
  };

  const getClassName = (field: GridField, row: any): string => {
    let style = '';
    
    if (field && field.style) {
      style += ' ' + field.style;
    }
    
    if (field && field.applyStyleWith) {
      style += ' ' + `${field.applyStyleWith}-${row[field.styleField]?.toLowerCase().split(' ').join('')}`;
    }
    
    return style;
  };

  const getFieldValue = (row: any, field: GridField): string => {
    if (field.displayType === 'updateInfo') {
      return row[field.name] || field.default || '';
    }
    
    return row[field.name] || field.default || '';
  };

  const onRowClick = (row: any, field: GridField) => {
    if (field.clickHandler && handler[field.clickHandler]) {
      handler[field.clickHandler](row);
    }
  };

  const disableConditionBased = (action: any, row: any): boolean => {
    if (action.dispCondField) {
      if (typeof action.dispCondField === 'object') {
        return Object.keys(action.dispCondField).every(element => {
          const value = _.get(row, element);
          
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
        const value = _.get(row, action.dispCondField);
        return value === action.dispCondValue;
      }
    }
    
    return true;
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="card-container my-6">
      <div className="card-list flex flex-wrap">
        {currentPageData.map((row, index) => (
          <Card key={index} className="w-[31.68%] m-2 mb-5 border border-gray-300 rounded-lg shadow-none hover:border-blue-300">
            <CardHeader
              action={
                <div className="flex items-center">
                  <Button
                    variant="outlined"
                    size="small"
                    className={getStatusClass(row.status)}
                  >
                    {row.status || 'no status'}
                  </Button>
                  <IconButton 
                    aria-label="more"
                    onClick={(e) => handleMenuOpen(e, row)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    {config.actions.map((action, actionIndex) => (
                      disableConditionBased(action, selectedRow) && (
                        <MenuItem 
                          key={actionIndex} 
                          onClick={() => handleActionClick(action)}
                          className="flex items-center gap-2"
                        >
                          <span className="material-icons text-sm">{action.iconname}</span>
                          {action.name}
                        </MenuItem>
                      )
                    ))}
                  </Menu>
                </div>
              }
              title={
                <>
                  {config.data.map((section, sectionIndex) => (
                    section.section === 'section1' && (
                      <div key={sectionIndex}>
                        {section.fields.map((field, fieldIndex) => (
                          <Tooltip 
                            key={fieldIndex} 
                            title={row[field.name]?.length > (config.commonProperties?.ellipsisMaxLength || 30) ? row[field.name] : ''}
                          >
                            <Typography 
                              className={`${row[field.className] || 'text-lg font-semibold text-blue-800 cursor-pointer'} truncate`}
                              onClick={() => onRowClick(row, field)}
                            >
                              {row[field.name]}
                            </Typography>
                          </Tooltip>
                        ))}
                      </div>
                    )
                  ))}
                </>
              }
              className="pb-0"
            />
            <CardContent>
              {config.data.map((section, sectionIndex) => (
                section.section !== 'section1' && (
                  <div key={sectionIndex}>
                    {sectionIndex > 1 && <div className="border-t border-gray-200 my-2"></div>}
                    
                    {section.singleRow ? (
                      <div className="flex justify-between mt-2">
                        {section.fields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="mr-6">
                            <Typography className="text-xs font-bold text-gray-500">
                              {field.label}
                            </Typography>
                            <Tooltip 
                              title={getFieldValue(row, field).length > (config.commonProperties?.gridViewEllipses || 30) ? getFieldValue(row, field) : ''}
                            >
                              <Typography 
                                className={`${getClassName(field, row) || 'text-sm'} truncate`}
                                onClick={() => onRowClick(row, field)}
                              >
                                {getFieldValue(row, field)}
                              </Typography>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        {section.fields.map((field, fieldIndex) => {
                          switch (field.displayType) {
                            case 'noLabel':
                              return (
                                <Tooltip 
                                  key={fieldIndex}
                                  title={row[field.name]?.length > (config.commonProperties?.ellipsisMaxLength || 30) ? row[field.name] : ''}
                                >
                                  <Typography className="text-sm text-gray-800 mt-4 truncate">
                                    {row[field.name] ? row[field.name] : field.default}
                                  </Typography>
                                </Tooltip>
                              );
                              
                            case 'updateInfo':
                              return (
                                <div key={fieldIndex} className="text-sm text-gray-500 mt-2">
                                  <span className="text-gray-800">{field.label}</span> {getFieldValue(row, field)}
                                  <div className="flex items-center text-xs font-semibold text-gray-500">
                                    <span className="material-icons text-sm mr-1">schedule</span>
                                    {row[field.time] ? formatDate(row[field.time]) : ''}
                                  </div>
                                </div>
                              );
                              
                            default:
                              return (
                                <div key={fieldIndex} className="mb-2">
                                  <Typography className="text-xs font-bold text-gray-500">
                                    {field.label}
                                  </Typography>
                                  <Typography className="text-sm">
                                    {row[field.name] ? row[field.name] : field.default}
                                  </Typography>
                                </div>
                              );
                          }
                        })}
                      </div>
                    )}
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {data && !data.length && (
        <Typography className="text-center text-sm italic my-8">
          No results found!
        </Typography>
      )}
      
      {config.paginationOptions && data && data.length > config.paginationOptions.pageSize && (
        <div className="pagination mt-4 flex justify-center">
          {/* Pagination component would go here */}
        </div>
      )}
    </div>
  );
};

export default DynamicGrid;