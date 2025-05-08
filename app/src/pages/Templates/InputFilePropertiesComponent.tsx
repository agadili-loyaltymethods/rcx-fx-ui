import React, { useState, useEffect } from 'react';
import DynamicForm from './DynamicForm';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import './InputFilePropertiesComponent.css';

interface Props {
  data: any;
  isView: boolean;
  activeFieldDetails: any;
  handlers: any;
  properties: any;
}

const InputFilePropertiesComponent: React.FC<Props> = ({
  data,
  isView,
  activeFieldDetails,
  handlers,
  properties,
}) => {
  const [config, setConfig] = useState({});
  const [formGroup, setFormGroup] = useState(null);

  const { getFormViewConfig } = useUiConfig();

  useEffect(() => {
    const fetchConfig = async () => {
      const configData = await getFormViewConfig('templates');
      setConfig(configData || {});
    };
    fetchConfig();
  }, []);

  const updateFormGroup = (formGroup: any) => {
    setFormGroup(formGroup);
    if (formGroup) {
      formGroup.addEventListener('change', () => {
        handlers.handleIsModifiedChange(true);
      });
    }
  };

  return (
    <div className="form">
      {config && (
        <DynamicForm
          data={data}
          config={config}
          properties={properties}
          activeFieldDetails={activeFieldDetails}
          title="inputFileProperties"
          formStatus={(formGroup: any) => updateFormGroup(formGroup)}
        />
      )}
    </div>
  );
};

export default InputFilePropertiesComponent;