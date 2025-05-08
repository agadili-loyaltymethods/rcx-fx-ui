import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './RCXFieldSelection.scss';

interface RCXFieldModel {
    value: string;
    label: string;
    type: string;
    parentType: string;
    required: boolean;
    minLength: number;
    maxLength: number;
    arrField: string;
}

interface Props {
    data: any;
    enumData: any;
    close: () => void;
    ok: (selectedField: RCXFieldModel | null) => void;
    handlers?: {
        updateForm: (selectedField: RCXFieldModel | null) => void;
    };
}

const RCXFieldSelection: React.FC<Props> = ({
    data,
    enumData,
    close,
    ok,
    handlers,
}) => {
    const [options, setOptions] = useState<RCXFieldModel[]>([]);
    const [filteredOptions, setFilteredOptions] = useState<RCXFieldModel[]>([]);
    const [selectedField, setSelectedField] = useState<RCXFieldModel | null>(null);
    const [rcxProcessLabel, setRcxProcessLabel] = useState<string>('');

    useEffect(() => {
        setOptions(data.formattedSchema || []);
        setFilteredOptions(JSON.parse(JSON.stringify(data.formattedSchema || [])));
        if (data.rowData && data.rowData.rcxField) {
            const selectedField = filteredOptions.find(
                (f) => f.value === data.rowData.rcxField,
            );
            setSelectedField(selectedField ?? null);
        }
        const matchingEnum = enumData.RCXProcess.find(
            (enumItem: any) => enumItem.value === data.properties?.rcxProcess,
        );
        if (matchingEnum) {
            setRcxProcessLabel(matchingEnum.label);
        }
    }, [data, enumData]);

    const selectField = (field: RCXFieldModel) => {
        setSelectedField(field);
    };

    const handleOk = () => {
        if (data.rowData) {
            data.rowData.rcxField = selectedField?.value;
            if (selectedField?.parentType === 'array') {
                data.rowData.parentType = 'array';
                data.rowData.arrField = selectedField?.arrField;
            } else {
                delete data.rowData.rcxFieldArrLen;
                delete data.rowData.parentType;
                delete data.rowData.arrField;
            }
        }
        if (handlers && handlers.updateForm) {
            handlers.updateForm(selectedField ?? null);
        }
        ok(selectedField ?? null);
        close();
    };

    const filterData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const filteredOptions = options.filter(
            (x) => x?.label?.toLowerCase()?.indexOf(value?.toLowerCase()) > -1,
        );
        setFilteredOptions(filteredOptions);
        if (data.rowData && data.rowData.rcxField) {
            const selectedField = filteredOptions.find(
                (f) => f.value === data.rowData.rcxField,
            );
            setSelectedField(selectedField ?? null);
        }
    };

    return (
        <div className="rcxfield-modal">
            <div className="modal-title">
                <div className="title">RCX Field Selection</div>
                <div className="close-icon" onClick={close}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                </div>
            </div>
            <div className="modal-content">
                <div className="rcxcontainer-wrap">
                    <div className="search-wrap search-input-container">
                        <div className="mat-mdc-form-field">
                            <div className="mat-mdc-form-field-wrapper">
                                <div className="mat-mdc-form-field-outer-container">
                                    <input
                                        className="mat-mdc-input"
                                        type="search"
                                        placeholder="Search"
                                        onChange={filterData}
                                    />
                                    <div className="mat-mdc-form-field-prefix">
                                        <svg width="24" height="24" viewBox="0 0 24 24">
                                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-1.21 4.42-2.79l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="list-name">{rcxProcessLabel}</div>
                    <div className="list-wrap">
                        {filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                className="list-desc"
                                onClick={() => selectField(option)}
                            >
                                {selectedField === option && (
                                    <span className="icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24">
                                            <path d="M10.93 4.93c0-1.08-.88-1.95-2-1.95S6.95 3.85 6.95 5c0 .58.36 1.14.88 1.35A1.217 1.217 0 0 0 9 6.95 1.188 1.188 0 0 0 9 7a1.188 1.188 0 0 0 1.066.95 1.217 1.217 0 0 0 1.063 0l3.039-.957C14.79 7.49 16 8.89 16 11.05c0 3.76-2.95 6.65-7.1 7.43v1.5H7.04v-1.5c-.245-.174-1.06-.4-2.549-.611 0 0-.383-.94 1.923-.955 1.443-.01 2.35.433 2.593 1.063 0 0 .996 1.2 2.973 1.356V10.5h1.514v-3.787c-.001-.893-.511-1.945-1.51-2.543zm4.483 2.955V14.5h1.51v-3.787c0-.698.511-1.723 1.51-2.15.601-.273 1.469.046 2.354.625 1.295.671 1.85 1.788 1.504 3.562h-1.514v3.787z"></path>
                                        </svg>
                                    </span>
                                )}
                                <span className={selectedField !== option ? 'ml-30' : ''}>
                                    {option.label + (option.required ? '*' : '')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="modal-buttons">
                <div className="right-elements">
                    <button className="btn primary-btn" onClick={handleOk}>
                        Ok
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RCXFieldSelection;