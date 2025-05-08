import React, { useState, useEffect } from 'react';
import { useUiConfig } from '@/services/ui-config/useUiConfig';

interface Date {
  id: string;
  name: string;
}

interface Properties {
  // Add properties type definition here
}

interface ActiveFieldDetails {
  // Add activeFieldDetails type definition here
}

interface Data {
  // Add data type definition here
}

interface EnumData {
  DataType: Date[];
}

interface Handlers {
  handleIsModifiedChange: (isModified: boolean) => void;
}

interface Config {
  // Add config type definition here
}

interface FormStatus {
  formGroup: any;
}

interface InputFooterPropertiesProps {
  properties: Properties;
  activeFieldDetails: ActiveFieldDetails;
  data: Data;
  enumData: EnumData;
  handlers: Handlers;
}

const InputFooterProperties: React.FC<InputFooterPropertiesProps> = ({
  properties,
  activeFieldDetails,
  data,
  enumData,
  handlers,
}) => {
  const [config, setConfig] = useState<Config | null>(null);
  const { getFormViewConfig } = useUiConfig();

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getFormViewConfig('templates');
      setConfig(config || {});
    };
    fetchConfig();
  }, [getFormViewConfig]);

  const [formData, setFormData] = useState(data || {});
  const [enumDataState, setEnumDataState] = useState(enumData || {});
  const [formStatus, setFormStatus] = useState({});

  useEffect(() => {
    setFormData(data || {});
    setEnumDataState(enumData || {});
    setEnumDataState((prevState) => ({
      ...prevState,
      DataType: enumData.DataType || [],
    }));
  }, [data, enumData]);

  const updateFormGroup = (formGroup: any) => {
    setFormStatus(formGroup);
    // Simulating formGroup.valueChanges subscription
    formGroup.addEventListener('change', () => {
      handlers.handleIsModifiedChange(true);
    });
  };

  if (!config) return null;

  return (
    <div className="form">
      <DynamicForm
        data={formData}
        handlers={handlers}
        properties={properties}
        activeFieldDetails={activeFieldDetails}
        requiredData={enumDataState}
        config={config}
        title="inputFooterProperties"
        onFormStatusChange={updateFormGroup}
      />
    </div>
  );
};

export default InputFooterProperties;