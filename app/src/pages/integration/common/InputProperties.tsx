import React, { useState, useEffect } from 'react';
import { DynamicForm } from '@/components/common';

interface InputPropertiesProps {
  data: any;
  handlers: any;
  properties: any;
  formStatus?: (formGroup: any) => void;
}

const InputProperties: React.FC<InputPropertiesProps> = ({ 
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
          intInputProperties: {
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
                    field: 'inputMustExist',
                    label: 'Input Must Exist',
                    type: 'switch'
                  },
                  {
                    field: 'maxRetries',
                    label: 'Max Retries',
                    type: 'number',
                    required: true
                  },
                  {
                    field: 'retryIntervalSeconds',
                    label: 'Retry Interval (seconds)',
                    type: 'number',
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

  const handleConnectionTypeChange = () => {
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
            <p className="tproperties">Input Properties</p>
          </div>
        </div>
      </div>
      
      {config && (
        <DynamicForm
          config={config}
          data={data}
          handlers={{
            ...handlers,
            onConnectionTypeChange: handleConnectionTypeChange
          }}
          requiredData={requiredData}
          title="intInputProperties"
          formStatus={updateFormGroup}
        />
      )}
    </div>
  );
};

export default InputProperties;