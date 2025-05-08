import React, { useState, useEffect } from 'react';
import { DynamicForm } from '@/components/common';

interface SchedulingPropertiesProps {
  data: any;
  handlers: any;
  properties: any;
  formStatus?: (formGroup: any) => void;
}

const SchedulingProperties: React.FC<SchedulingPropertiesProps> = ({ 
  data, 
  handlers, 
  properties,
  formStatus 
}) => {
  const [config, setConfig] = useState<any>(null);
  const [requiredData, setRequiredData] = useState<any>({});

  useEffect(() => {
    // In a real implementation, this would fetch from a config service
    const fetchConfig = async () => {
      // Simulating config fetch
      setConfig({
        data: {
          intSchedulingProperties: {
            dataFields: [
              {
                fields: [
                  {
                    field: 'effectiveDate',
                    label: 'Effective Date',
                    type: 'dateTime',
                    required: true
                  },
                  {
                    field: 'repeating',
                    label: 'Repeating',
                    type: 'switch'
                  },
                  {
                    field: 'frequency',
                    label: 'Frequency',
                    type: 'select',
                    selectData: 'FrequencyType',
                    selectLabel: 'label',
                    selectValue: 'value',
                    required: true,
                    dispCondField: 'repeating',
                    dispCondValue: true
                  },
                  {
                    field: 'repeatInterval',
                    label: 'Repeat Interval',
                    type: 'number',
                    required: true,
                    dispCondField: 'repeating',
                    dispCondValue: true
                  },
                  {
                    field: 'controlRate',
                    label: 'Control Rate',
                    type: 'number',
                    required: true,
                    configCheck: true,
                    max: 'MAX_CONTROL_RATE'
                  }
                ]
              }
            ]
          }
        }
      });
    };
    
    fetchConfig();
    
    // Get frequency types
    if (handlers.getEnumsByType) {
      setRequiredData({
        FrequencyType: handlers.getEnumsByType('FrequencyType') || []
      });
    }
  }, [handlers]);

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
            <p className="tproperties">Scheduling Properties</p>
          </div>
        </div>
      </div>
      
      {config && (
        <DynamicForm
          config={config}
          data={data}
          handlers={handlers}
          requiredData={requiredData}
          title="intSchedulingProperties"
          formStatus={updateFormGroup}
        />
      )}
    </div>
  );
};

export default SchedulingProperties;