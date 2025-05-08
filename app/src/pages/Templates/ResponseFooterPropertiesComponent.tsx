// ResponseFooterPropertiesComponent.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import DynamicForm from './DynamicForm';
import './ResponseFooterPropertiesComponent.css';

interface ResponseFooterPropertiesProps {
  properties: any;
  activeFieldDetails: any;
  data: any;
  enumData: any;
  handlers: any;
  valueFields: any;
}

const ResponseFooterPropertiesComponent: React.FC<ResponseFooterPropertiesProps> = ({
  properties,
  activeFieldDetails,
  data,
  enumData,
  handlers,
  valueFields,
}) => {
  const { config } = useUiConfig('templates');
  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useForm();

  const [valueOptions, setValueOptions] = React.useState<any>([]);

  useEffect(() => {
    const values = ['Error Code', 'Error Message', 'HTTP Status', 'Constant', 'Row Number'];
    if (properties.rcxProcess === 'Activity') {
      values.push('ActivityId');
    }
    setValueOptions(values);
    enumData.valueOptions = valueOptions;
  }, [properties, enumData, valueOptions]);

  const handleFieldNameUpdate = (formGroup: any) => {
    if (
      (!formGroup.get('filedName')?.value ||
        formGroup.get('fieldName')?.value ===
          'defaultFieldName' ||
        valueOptions.includes(data?.fieldName)) &&
      data.value
    ) {
      formGroup.get('fieldName').setValue(data.value);
    }
  };

  const updateFormGroup = (formGroup: any) => {
    handlers.handleIsModifiedChange(true);
  };

  const addHandler = () => {
    handlers.handleFieldNameUpdate = handleFieldNameUpdate;
  };

  React.useEffect(() => {
    addHandler();
  }, [handlers]);

  if (!config) return null;

  return (
    <div className="form">
      <DynamicForm
        data={data}
        properties={properties}
        activeFieldDetails={activeFieldDetails}
        requiredData={enumData}
        config={config}
        title="responseFooterProperties"
        handlers={handlers}
        formStatus={updateFormGroup}
      />
    </div>
  );
};

export default ResponseFooterPropertiesComponent;