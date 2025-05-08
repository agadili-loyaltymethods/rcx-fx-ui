import React, { useState, useEffect } from 'react';
import { DynamicForm } from '@/components/common';

interface ResponsePropertiesProps {
  data: any;
  handlers: any;
  properties: any;
  formStatus?: (formGroup: any) => void;
}

const ResponseProperties: React.FC<ResponsePropertiesProps> = ({ 
  data, 
  handlers, 
  properties,
  formStatus 
}) => {
  const [connections, setConnections] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [requiredData, setRequiredData] = useState<any>({});

  useEffect(() => {
    // In a real implementation, this would fetch from a config service
    const fetchConfig = async () => {
      // Simulating config fetch
      setConfig({
        data: {
          intResponseProperties: {
            dataFields: [
              {
                fields: [
                  {
                    field: 'connectionType',
                    label: 'Connection Type',
                    type: 'select',
                    selectData: 'ConnectionType',
                    selectLabel: 'label',
                    selectValue: 'value',
                    required: true,
                    selectionChange: 'onConnectionTypeChange'
                  },
                  {
                    field: 'connection',
                    label: 'Connection',
                    type: 'select',
                    selectData: 'connections',
                    selectLabel: 'name',
                    selectValue: '_id',
                    required: true
                  },
                  {
                    field: 'path',
                    label: 'Path',
                    type: 'text',
                    required: true
                  },
                  {
                    field: 'archivePath',
                    label: 'Archive Path',
                    type: 'text'
                  },
                  {
                    field: 'filePattern',
                    label: 'File Pattern',
                    type: 'text',
                    required: true
                  }
                ]
              }
            ]
          }
        }
      });
    };
    
    fetchConfig();
    
    // Get connections by partner
    setConnections(handlers.getConnectionsByParnter());
    setRequiredData({ connections: handlers.getConnectionsByParnter() });
  }, [handlers]);

  const onConnectionTypeChange = () => {
    if (data) {
      data.connection = '';
      const updatedConnections = handlers.getConnectionsByParnter();
      setConnections(updatedConnections);
      setRequiredData(prev => ({ ...prev, connections: updatedConnections }));
    }
  };

  const updateFormGroup = (formGroup: any) => {
    if (formStatus) {
      formStatus(formGroup);
    }
    
    // Subscribe to form changes
    if (formGroup.valueChanges && formGroup.valueChanges.subscribe) {
      formGroup.valueChanges.subscribe(() => {
        if (handlers.handleIsModifiedChange) {
          handlers.handleIsModifiedChange(true);
        }
      });
    }
  };

  return (
    <div className="form">
      <div className="right-panel-header border-b border-gray-200 py-4 px-8">
        <div className="right-panel-left-content">
          <div className="bread-crum text-base font-semibold text-gray-900">
            <p className="tproperties">Response Properties</p>
          </div>
        </div>
      </div>
      
      {config && (
        <DynamicForm
          config={config}
          data={data}
          handlers={{
            ...handlers,
            onConnectionTypeChange
          }}
          requiredData={requiredData}
          title="intResponseProperties"
          formStatus={updateFormGroup}
        />
      )}
    </div>
  );
};

export default ResponseProperties;