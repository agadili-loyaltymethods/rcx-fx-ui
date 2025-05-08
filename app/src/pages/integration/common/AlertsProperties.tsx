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
import CreateEditAlert from './CreateEditAlert';

interface AlertsPropertiesProps {
  data: any[];
  handlers: any;
  isView: boolean;
  dataChange: (data: any[]) => void;
}

const AlertsProperties: React.FC<AlertsPropertiesProps> = ({ 
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

  useEffect(() => {
    // In a real implementation, this would fetch from a config service
    setConfig({
      data: [
        { name: 'name', label: 'Alert Name', type: 'text' },
        { name: 'type', label: 'Alert Type', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'actions', label: 'Actions', type: 'actions' }
      ],
      actions: [
        { name: 'Edit', iconname: 'edit', clickHandler: 'edit' },
        { name: 'Delete', iconname: 'delete', clickHandler: 'delete' }
      ]
    });
    
    setDataCollection(data);
  }, [data]);

  useEffect(() => {
    if (dataChange) {
      dataChange(data);
    }
  }, [data, dataChange]);

  const handleSearchInputValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchedValue(value);
    
    if (value.length) {
      const filteredData = dataCollection.filter(
        (el) => el.name?.toLowerCase().includes(value)
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

  const handleDelete = (row: any, rowNum: number) => {
    const index = data.findIndex((alert, ind) => {
      if (!alert.name && !row.name) {
        return ind === rowNum;
      }
      return alert.name === row.name;
    });

    if (index !== -1) {
      const newData = [...data];
      newData.splice(index, 1);
      dataChange(newData);
    }
  };

  const handleOpenDialog = () => {
    setSelectedRow(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveAlert = (newAlert: any) => {
    if (selectedRow) {
      // Edit existing alert
      const newData = data.map((alert) =>
        alert.name === selectedRow.name ? newAlert : alert
      );
      dataChange(newData);
    } else {
      // Add new alert
      const newData = [...data, newAlert];
      dataChange(newData);
    }
    setDialogOpen(false);
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
            <p className="tproperties">Alerts</p>
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
                placeholder="Search by Alert Name"
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
        <CreateEditAlert 
          data={{ row: selectedRow || data, handlers }}
          onClose={handleCloseDialog}
          onSave={handleSaveAlert}
        />
      </Dialog>
    </div>
  );
};

export default AlertsProperties;