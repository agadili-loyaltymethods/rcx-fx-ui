import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import DynamicForm from './DynamicForm';
import './response-header-properties.css';

const options = ['String', 'Number'];
const sharedConstants = {
    defaultFieldName: 'default-field-name',
};

const ResponseHeaderPropertiesComponent = ({
    properties,
    activeFieldDetails,
    data,
    enumData,
    valueFields,
    handlers,
}) => {
    const { getFormViewConfig } = useUiConfig();
    const [config, setConfig] = useState({});
    const [valueOptions, setValueOptions] = useState<any>([]);
    const { register, watch, setValue, formState } = useForm({
        defaultValues: {
            fieldName: '',
        },
    });

    useEffect(() => {
        const fetchConfig = async () => {
            const configData = await getFormViewConfig('templates');
            setConfig(configData || {});
        };
        fetchConfig();
    }, [getFormViewConfig]);

    useEffect(() => {
        const values = [
            'Error Code',
            'Error Message',
            'HTTP Status',
            'Constant',
            'Row Number',
        ];
        if (properties.rcxProcess === 'Activity') {
            values.push('ActivityId');
        }
        setValueOptions(values);
        enumData.valueOptions = valueOptions || [];
    }, [properties, enumData]);

    const handleFieldNameUpdate = (data: any) => {
        if (
            (!data.fieldName ||
                data.fieldName === sharedConstants.defaultFieldName ||
                valueOptions.includes(data.fieldName)) &&
            data.value
        ) {
            setValue('fieldName', data.value);
        }
    };

    const updateFormGroup = (data:any) => {
        handlers.handleIsModifiedChange(true);
    };

    useEffect(() => {
        handlers.handleFieldNameUpdate = handleFieldNameUpdate;
    }, [handlers]);

    return (
        <div className="form">
            {config && (
                <DynamicForm
                    data={data}
                    handlers={{
                        ...handlers,
                        handleFieldNameUpdate,
                    }}
                    properties={properties}
                    activeFieldDetails={activeFieldDetails}
                    requiredData={enumData}
                    config={config}
                    title="responseHeaderProperties"
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    formState={formState}
                    updateFormGroup={updateFormGroup}
                />
            )}
        </div>
    );
};

export default ResponseHeaderPropertiesComponent;