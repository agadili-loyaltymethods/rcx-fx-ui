import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  InputAdornment, 
  Button, 
  Typography,
  Dialog
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { DynamicTable } from '@/components/common';
import CreateEditErrorCodeMapping from './CreateEditErrorCodeMapping';

interface ErrorCodeMappingPropertiesProps {
  data: any[];
  handlers: any;
  isView: boolean;
  dataChange: (data: any[]) => void;
}

const ErrorCodeMappingProperties: React.FC<ErrorCodeMappingPropertiesProps> = ({ 
  data, 
  handlers, 
  isView,
  dataChange 
}) => {
  const [searchedValue, setSearchedValue] = useState('');
  const [dataCollection, setDataCollection] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [errorCodes, setErrorCodes] = useState<any[]>([]);

  useEffect(() => {
    // In a real implementation, this would fetch from a config service
    setConfig({
      data: [
        { name: 'rcxErrorCode', label: 'RCX Error Code', type: 'text' },
        { name: 'errorCodeDes', label: 'Error Code Description', type: 'text' },
        { name: 'partnerErrorCode', label: 'Partner Error Code', type: 'text' },
        { name: 'actions', label: 'Actions', type: 'actions' }
      ],
      actions: [
        { name: 'Edit', iconname: 'edit', clickHandler: 'edit' },
        { name: 'Delete', iconname: 'delete', clickHandler: 'delete' }
      ]
    });
    
    // Get error codes from handlers
    if (handlers?.getEnumsByType) {
      setErrorCodes(handlers.getEnumsByType('RCXErrorCode') || []);
    }
    
    // Map descriptions to error codes
    mapDescription();
  }, [data, handlers]);

  const mapDescription = () => {
    const mappedData = data.map(item => {
      const errCode = errorCodes.find(
        (x) => x.value.toString() === item.rcxErrorCode
      );
      
      return {
        ...item,
        errorCodeDes: errCode?.desc || 'Description'
      };
    });
    
    setDataCollection(mappedData);
    dataChange(mappedData);
  };

  const handleSearchInputValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchedValue(value);
    
    if (value.length) {
      const filteredData = dataCollection.filter(
        (el) => 
          el.rcxErrorCode.toString().includes(value) ||
          el.errorCodeDes.toLowerCase().includes(value)
      );
      dataChange(filteredData);
    } else {
      dataChange(dataCollection);
    }
  };

  const handleEdit = (row: any) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };

  const handleDelete = (row: any) => {
    const index = data.findIndex(
      (errorCode) => errorCode.rcxErrorCode === row.rcxErrorCode
    );

    if (index !== -1) {
      const newData = [
        ...data.slice(0, index),
        ...data.slice(index + 1)
      ];
      
      dataChange(newData);
      mapDescription();
    }
  };

  const handleOpenDialog = () => {
    setSelectedRow(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveErrorCodeMapping = (newErrorCode: any) => {
    if (selectedRow) {
      // Edit existing error code mapping
      const newData = data.map((errorCode) =>
        errorCode.rcxErrorCode === selectedRow.rcxErrorCode ? newErrorCode : errorCode
      );
      dataChange(newData);
    } else {
      // Add new error code mapping
      const newData = [...data, newErrorCode];
      dataChange(newData);
    }
    
    setDialogOpen(false);
    mapDescription();
  };

  const tableHandlers = {
    edit: handleEdit,
    delete: handleDelete
  };

  return (
    <div className="form">
      <div className="right-panel-header">
        <div className="right-panel-left-content">
          <div className="bread-crum">
            <p className="tproperties">Error Code Mapping</p>
          </div>
        </div>
      </div>
      <div className="right-panel-main-content">
        <div className="dash-tablewrap border border-gray-200 rounded-md">
          <div className="title-wrap flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by Error Code or Description"
                className="search-box w-[370px]"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="icon-small text-gray-400" />
                    </InputAdornment>
                  ),
                }}
                onChange={handleSearchInputValueChange}
              />
            </div>
            {!isView && (
              <Button
                variant="contained"
                startIcon={<AddIcon className="icon-small" />}
                onClick={handleOpenDialog}
                className="bg-blue-800 hover:bg-blue-900"
              >
                Create New
              </Button>
            )}
          </div>
          <div className="table">
            <div className="responsive-table">
              {config && (
                <DynamicTable
                  config={config}
                  data={data}
                  isView={isView}
                  handlers={tableHandlers}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <CreateEditErrorCodeMapping 
          data={{
            row: selectedRow,
            handlers,
            errorCodes
          }}
          onClose={handleCloseDialog}
          onSave={handleSaveErrorCodeMapping}
        />
      </Dialog>
    </div>
  );
};

export default ErrorCodeMappingProperties;