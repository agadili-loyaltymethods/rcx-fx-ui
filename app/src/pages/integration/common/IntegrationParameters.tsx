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
import CreateEditIntegrationParameter from './CreateEditIntegrationParameter';

interface IntegrationParametersProps {
  data: any[];
  handlers: any;
  isView: boolean;
  dataChange: (data: any[]) => void;
}

const IntegrationParameters: React.FC<IntegrationParametersProps> = ({ 
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
        { name: 'name', label: 'Parameter Name', type: 'text' },
        { name: 'type', label: 'Parameter Type', type: 'text' },
        { name: 'value', label: 'Parameter Value', type: 'text' },
        { name: 'actions', label: 'Actions', type: 'actions' }
      ],
      actions: [
        { name: 'Edit', iconname: 'edit', clickHandler: 'edit' },
        { name: 'Delete', iconname: 'delete', clickHandler: 'delete' }
      ]
    });
    
    setDataCollection(data);
  }, [data]);

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
    const index = data.findIndex((parameter, ind) => {
      if (!parameter.name && !row.name) {
        return ind === rowNum;
      }
      return parameter.name === row.name;
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

  const handleSaveParameter = (parameter: any) => {
    if (selectedRow) {
      // Edit existing parameter
      const newData = data.map((item) =>
        item.name === selectedRow.name ? parameter : item
      );
      dataChange(newData);
    } else {
      // Add new parameter
      const newData = [...data, parameter];
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
            <p className="tproperties">Integration Parameters</p>
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
                placeholder="Search by Parameter Name"
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
        <CreateEditIntegrationParameter 
          data={{
            row: selectedRow,
            handlers
          }}
          onClose={handleCloseDialog}
          onSave={handleSaveParameter}
        />
      </Dialog>
    </div>
  );
};

export default IntegrationParameters;