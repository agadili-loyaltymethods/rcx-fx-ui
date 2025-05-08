import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import AppDynamicForm from './app-dynamic-form';

interface InputHeaderPropertiesProps {
  properties: any;
  activeFieldDetails: any;
  data: any;
  enumData: any;
  handlers: any;
}

const InputHeaderProperties = (props: InputHeaderPropertiesProps) => {
  const [config, setConfig] = useState(null);
  const uiConfigService = useUiConfig();

  const updateFormGroup = useCallback((data: any) => {
    props.handlers.handleIsModifiedChange(true);
  }, [props.handlers]);

  useEffect(() => {
    const getConfig = async () => {
      const config = await uiConfigService.getFormViewConfig('templates');
      setConfig(config || {});
    };
    getConfig();
  }, []);

  useEffect(() => {
    props.data = props.data || {};
    props.enumData = props.enumData || {};
    props.enumData.DataType = props.enumData.DataType || [];
  }, [props.data, props.enumData]);

  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    updateFormGroup(data);
  };

  return (
    <div className="form">
      {config && (
        <AppDynamicForm
          data={props.data}
          handlers={props.handlers}
          properties={props.properties}
          activeFieldDetails={props.activeFieldDetails}
          requiredData={props.enumData}
          config={config}
          title="inputHeaderProperties"
          onSubmit={onSubmit}
          register={register}
        />
      )}
    </div>
  );
};

export default InputHeaderProperties;