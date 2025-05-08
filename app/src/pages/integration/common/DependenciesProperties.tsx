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
import CreateEditDependency from './CreateEditDependency';

interface DependenciesPropertiesProps {
  data: any[];
  handlers: any;
  integrations: any[];
  isView: boolean;
  dataChange: (data: any[]) => void;
}

const DependenciesProperties: React.FC<DependenciesPropertiesProps> = ({ 
  data, 
  handlers, 
  integrations,
  isView,
  dataChange 
}) => {
  const [searchedValue, setSearchedValue] = useState('');
  const [listData, setListData] = useState<any[]>([]);
  const [dataCollection, setDataCollection] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, this would fetch from a config service
    setConfig({
      data: [
        { name: 'name', label: 'Dependency Name', type: 'text' },
        { name: 'type', label: 'Dependency Type', type: 'text' },
        { name: 'list', label: 'Integrations', type: 'text' },
        { name: 'actions', label: 'Actions', type: 'actions' }
      ],
      actions: [
        { name: 'Edit', iconname: 'edit', clickHandler: 'edit' },
        { name: 'Delete', iconname: 'delete', clickHandler: 'delete' }
      ]
    });
    
    setInitialData();
  }, [data, integrations]);

  const setInitialData = () => {
    const formattedData = data.map(d => {
      const integrationNames = d.list
        .map((id: string) => {
          const integration = integrations.find(i => i.id === id);
          return integration ? integration.name : null;
        })
        .filter(Boolean);
      
      return { 
        ...d, 
        list: integrationNames 
      };
    });
    
    setListData(formattedData);
    setDataCollection(formattedData);
  };

  const handleSearchInputValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchedValue(value);
    
    if (value.length) {
      const filteredData = dataCollection.filter(
        (el) => el.name?.toLowerCase().includes(value)
      );
      setListData(filteredData);
    } else {
      setListData(dataCollection);
    }
  };

  const handleEdit = (row: any) => {
    // Find the original row with IDs instead of names
    const originalRow = { ...row };
    const found = data.find(
      (d) => d.name === row.name && d.type === row.type
    );
    
    if (found && found.list) {
      originalRow.list = [...found.list];
    }
    
    setSelectedRow(originalRow);
    setDialogOpen(true);
  };

  const handleDelete = (row: any, rowNum: number) => {
    const index = data.findIndex((dependency, ind) => {
      if (!dependency.name && !row.name) {
        return ind === rowNum;
      }
      return dependency.name === row.name;
    });

    if (index > -1) {
      const newData = [
        ...data.slice(0, index),
        ...data.slice(index + 1)
      ];
      
      dataChange(newData);
      setInitialData();
    }
  };

  const handleCreate = () => {
    setSelectedRow(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveDependency = (dependency: any) => {
    if (selectedRow) {
      // Edit existing dependency
      const newData = data.map((item) =>
        item.name === selectedRow.name ? dependency : item
      );
      dataChange(newData);
    } else {
      // Add new dependency
      const newData = [...data, dependency];
      dataChange(newData);
    }
    
    setDialogOpen(false);
    setInitialData();
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
            <p className="tproperties">Dependencies</p>
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
                placeholder="Search by Dependency Name"
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
                onClick={handleCreate}
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
                  data={listData}
                  handlers={tableHandlers}
                  isView={isView}
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
        <CreateEditDependency 
          data={{
            row: selectedRow,
            handlers,
            integrations
          }}
          onClose={handleCloseDialog}
          onSave={handleSaveDependency}
        />
      </Dialog>
    </div>
  );
};

export default DependenciesProperties;