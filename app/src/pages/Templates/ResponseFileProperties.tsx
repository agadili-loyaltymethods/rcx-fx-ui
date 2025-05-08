import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import DynamicForm from './DynamicForm';

const ResponseFileProperties = ({ data, activeFieldDetails, properties, handlers }) => {
  const { register, watch, handleSubmit, setValue, getValues, formState: { isDirty } } = useForm();
  const [config, setConfig] = useState({});
  const { getFormViewConfig } = useUiConfig();

  const updateFormGroup = (formGroup) => {
    handlers.handleIsModifiedChange(true);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      const configData = await getFormViewConfig('templates');
      setConfig(configData || {});
    };
    fetchConfig();
  }, [getFormViewConfig]);

  return (
    <div className="form">
      {config && (
        <DynamicForm
          data={data}
          properties={properties}
          activeFieldDetails={activeFieldDetails}
          config={config}
          title="responseFileProperties"
          onChange={updateFormGroup}
          register={register}
          watch={watch}
          handleSubmit={handleSubmit}
          setValue={setValue}
          getValues={getValues}
          isDirty={isDirty}
        />
      )}
    </div>
  );
};

export default ResponseFileProperties;