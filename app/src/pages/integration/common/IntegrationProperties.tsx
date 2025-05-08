import React, { useState, useEffect } from 'react';
import { DynamicForm } from '@/components/common';

interface IntegrationPropertiesProps {
  properties: any;
  handlers: any;
  partners: any[];
  templates: any[];
  isView?: boolean;
  formStatus?: (formGroup: any) => void;
}

const IntegrationProperties: React.FC<IntegrationPropertiesProps> = ({ 
  properties, 
  handlers, 
  partners,
  templates,
  isView = false,
  formStatus 
}) => {
  const [filteredPartners, setFilteredPartners] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [requiredData, setRequiredData] = useState<any>({});
  const [formGroup, setFormGroup] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, this would fetch from a config service
    const fetchConfig = async () => {
      // Simulating config fetch
      setConfig({
        data: {
          integrationProperties: {
            dataFields: [
              {
                fields: [
                  {
                    field: 'name',
                    label: 'Name',
                    type: 'text',
                    required: true
                  },
                  {
                    field: 'partner',
                    label: 'Partner',
                    type: 'select-search',
                    selectData: 'Partners',
                    selectLabel: 'name',
                    selectValue: '_id',
                    required: true,
                    formControl: 'partnerFormControl',
                    selectionChange: 'PartnerChange'
                  },
                  {
                    field: 'template',
                    label: 'Template',
                    type: 'select',
                    selectData: 'templates',
                    selectLabel: 'name',
                    selectValue: '_id',
                    required: true
                  },
                  {
                    field: 'description',
                    label: 'Description',
                    type: 'text'
                  }
                ]
              }
            ]
          }
        }
      });
    };
    
    fetchConfig();
  }, []);

  useEffect(() => {
    setRequiredData({
      Partners: partners,
      templates: templates
    });
  }, [partners, templates]);

  const updateFormGroup = (formGroupData: any) => {
    setFormGroup(formGroupData);
    
    // Add search filtering for partners
    if (formGroupData.controls?.partnerFormControl?.valueChanges) {
      formGroupData.controls.partnerFormControl.valueChanges.subscribe((searchTerm: string) => {
        setRequiredData(prev => ({
          ...prev,
          Partners: filterPartners(searchTerm)
        }));
      });
    }
    
    // Set partner form control in required data
    setRequiredData(prev => ({
      ...prev,
      partnerFormControl: formGroupData.controls?.partnerFormControl
    }));
    
    // Emit form status to parent
    if (formStatus) {
      formStatus(formGroupData);
    }
    
    // Subscribe to form changes
    if (formGroupData.valueChanges) {
      formGroupData.valueChanges.subscribe(() => {
        if (handlers.handleIsModifiedChange) {
          handlers.handleIsModifiedChange(true);
        }
      });
    }
  };

  const filterPartners = (searchTerm: string) => {
    return partners.filter((partner) =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const onPartnerChange = () => {
    if (formGroup) {
      formGroup.get('template').setValue('');
    }
    
    if (properties) {
      properties.inputProperties = {
        connectionType: '',
        connection: '',
        inputMustExist: false,
        path: '',
        archivePath: '',
        filePattern: ''
      };
      
      properties.responseProperties = {
        connectionType: '',
        connection: '',
        path: '',
        archivePath: '',
        filePattern: ''
      };
    }
    
    handlers.getTemplatesByParnter();
  };

  return (
    <div className="form">
      <div className="right-panel-header border-b border-gray-200 py-4 px-8">
        <div className="right-panel-left-content">
          <div className="bread-crum text-base font-semibold text-gray-900">
            <p className="tproperties">Integration Properties</p>
          </div>
        </div>
      </div>
      
      {config && (
        <DynamicForm
          config={config}
          data={properties}
          handlers={{
            ...handlers,
            PartnerChange: onPartnerChange
          }}
          requiredData={requiredData}
          title="integrationProperties"
          formStatus={updateFormGroup}
        />
      )}
    </div>
  );
};

export default IntegrationProperties;