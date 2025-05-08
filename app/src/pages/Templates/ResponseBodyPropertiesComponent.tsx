// ResponseBodyPropertiesComponent.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DynamicForm from './DynamicForm';
import sharedConstants from 'src/shared';
import { useUiConfig } from '@/services/ui-config/useUiConfig';


interface RESPONSEBODYINTERFACE {
  rcxProcess?: string;
  inputFileLayout?: any;
}

interface Props {
  properties?: RESPONSEBODYINTERFACE;
  activeFieldDetails?: any;
  data?: any;
  enumData?: any;
  handlers?: any;
  valueFields?: any;
}

const ResponseBodyPropertiesComponent: React.FC<Props> = (props) => {
  const { properties, activeFieldDetails, data, enumData, handlers, valueFields } = props;
  const [config, setConfig] = useState<any>(null);
  const [valueOptions, setValueOptions] = useState<any>([]);
  const { register, handleSubmit, watch, formState } = useForm();

  const uiConfigService = useUiConfig();

  const options = ['String', 'Number'];

  const addHandler = () => {
    handlers.handleFieldNameUpdate = handleFieldNameUpdate;
  };

  const getValues = () => {
    const values = ['Error Code', 'Error Message', 'HTTP Status', 'Constant', 'Row Number'];
    if (properties?.rcxProcess === 'Activity') {
      values.push('ActivityId');
    }
    if (properties?.inputFileLayout?.bodyFieldDefs?.length) {
      for (const field of properties.inputFileLayout.bodyFieldDefs) {
        if (field.rcxField && !values.includes(field.rcxField)) {
          values.push(field.rcxField);
        }
      }
    }
    setValueOptions(values);
    enumData.valueOptions = values;
  };

  const handleFieldNameUpdate = (formData: any) => {
    if (
      (!formData.filedName ||
        formData.fieldName === sharedConstants.defaultFieldName ||
        valueOptions.includes(data.fieldName)) &&
      data.value
    ) {
      formData.fieldName = data.value;
    }
  };

  const updateFormGroup = (formData: any) => {
    // emit form data
    console.log(formData);
    // watch form changes
    watch((values) => {
      handlers.handleIsModifiedChange(true);
    });
  };

  const onSubmit = (formData: any) => {
    updateFormGroup(formData);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      const configResponse = await uiConfigService.getFormViewConfig('templates');
      setConfig(configResponse || {});
    };
    fetchConfig();
    addHandler();
  }, []);

  useEffect(() => {
    if (properties && properties.inputFileLayout && properties.inputFileLayout.bodyFieldDefs) {
      getValues();
    }
  }, [properties, enumData]);

  return (
    <div className="form">
      {config && (
        <DynamicForm
          data={data}
          handlers={handlers}
          properties={properties}
          activeFieldDetails={activeFieldDetails}
          requiredData={enumData}
          config={config}
          title="responseBodyProperties"
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
};

export default ResponseBodyPropertiesComponent;