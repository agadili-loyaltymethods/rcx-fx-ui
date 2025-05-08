import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import DynamicForm from './DynamicForm'; // Assuming DynamicForm is available

const TemplateProperties = () => {
    const [properties, setProperties] = useState<any>({});
    const [partners, setPartners] = useState([]);
    const [enumData, setEnumData] = useState({});
    const [config, setConfig] = useState({});
    const [formGroup, setFormGroup] = useState(null);
    const [filteredPartners, setFilteredPartners] = useState([]);
    const { getFormViewConfig } = useUiConfig();

    const {
        register,
        watch,
        setValue,
        handleSubmit,
        getValues,
    } = useForm();

    useEffect(() => {
        const fetchConfig = async () => {
            const templateConfig = await getFormViewConfig('templates');
            setConfig(templateConfig || {});
        };
        fetchConfig();
    }, [getFormViewConfig]);

    useEffect(() => {
        if (properties?.partner) {
            setProperties({
                ...properties,
                partner: properties.partner._id || properties.partner,
            });
        }
    }, [properties]);

    const updateFormGroup = (formGroup: any) => {
        setFormGroup(formGroup);
        const searchTerm = watch('partnerFormControl');
        if (searchTerm) {
            const filtered = partners.filter((partner: any) =>
                partner.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            setEnumData((prevEnumData) => ({
                ...prevEnumData,
                partners: filtered,
            }));
        }
    };

    const handleChanges = () => {
        // Assuming handlers.handleIsModifiedChange is available
        // If not, please define or replace with desired functionality
        // handlers.handleIsModifiedChange(true);
    };

    const filterPartners = (searchTerm: any) => {
        const filtered = partners.filter((partner: any) =>
            partner.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        return filtered;
    };

    const resetRCXFields = () => {
        if (properties.inputFileLayout && properties.inputFileLayout.bodyFieldDefs) {
            properties.inputFileLayout.bodyFieldDefs.forEach((def:any) => {
                def.rcxField = '';
            });
        }
    };

    return (
        <div className="form">
            {config && (
                <DynamicForm
                    register={register}
                    watch={watch}
                    handleSubmit={handleSubmit}
                    setValue={setValue}
                    getValues={getValues}
                    requiredData={enumData}
                    properties={properties}
                    data={properties}
                    config={config}
                    title={'templateProperties'}
                    formStatus={updateFormGroup}
                    onChanges={handleChanges}
                />
            )}
        </div>
    );
};

export default TemplateProperties;