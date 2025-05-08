import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import { Service } from '@/shared/services/service';
import { sharedConstants } from '../../../shared';
import { RcxFieldSelectionComponent } from '../rcx-field-selection/rcx-field-selection.component';
import { TreeViewModalComponent } from 'src/app/common-components/tree-view-modal/tree-view-modal.component';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import DynamicForm from './dynamic-form';
import './input-body-properties.css';

interface Props {
  data: any;
  properties: any;
  enumData: any;
  activeFieldDetails: any;
  handlers: any;
  isView?: boolean;
  rcxSchemas: any;
  formStatus: (formGroup: any) => void;
}

const InputBodyPropertiesComponent: React.FC<Props> = ({
  data,
  properties,
  enumData,
  activeFieldDetails,
  handlers,
  isView = false,
  rcxSchemas,
  formStatus,
}) => {
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm();
  const { uiConfig } = useUiConfig();
  const service = new Service();

  const [formattedSchema, setFormattedSchema] = useState([]);
  const [rcxFieldOptions, setRcxFieldOptions] = useState([]);
  const [fields, setFields] = useState([]);
  const [rowData, setRowData] = useState({});
  const [operators, setOperators] = useState(['+', '-', '*', '/', '%']);
  const [isModified, setIsModified] = useState(false);

  const openRCXFieldDialog = useCallback((rowData: any) => {
    const dialogRef = window.open('', '_blank', 'width=800,height=600');
    const RcxFieldSelection = (
      <RcxFieldSelectionComponent
        data={{
          rowData,
          formattedSchema,
          properties,
          enumData,
          handlers: {
            updateForm: updateForm,
          },
        }}
      />
    );
    dialogRef?.document.body.appendChild(RcxFieldSelection);
  }, [formattedSchema, properties, enumData, updateForm]);

  const openTreeViewModal = useCallback((rowData: any) => {
    const dialogRef = window.open('', '_blank', 'width=800,height=600');
    const TreeViewModal = (
      <TreeViewModalComponent
        data={{
          rowData,
          formattedSchema,
          properties,
          enumData,
          handlers: {
            addTransform: addTransform,
          },
          fields,
          cancelButton: 'No',
        }}
      />
    );
    dialogRef?.document.body.appendChild(TreeViewModal);
  }, [formattedSchema, properties, enumData, addTransform, fields]);

  const addTransform = useCallback((data: any) => {
    if (data.transform === 'MappingTransform') {
      data.transformExpr = data;
      data.transformExprField = data;
    } else {
      let transformedField = '';
      // Create a copy of the data array without the 'Add' node
      const processData = [...data].filter(node => node.item !== 'Add');
      
      processData.forEach(field => {
        if (field.inputType === 'customText' || (data.transform === 'ArithmeticTransform' && operators.includes(field.item))) {
            transformedField += field.item + '\n';
        } else if(field.inputType === 'dropDown') {
            transformedField += '${' + field.item + '}'
        } 

      });
      
      // Store the original transformExpr with line breaks
      data.transformExpr = transformedField;
      
      // Create a display version without line breaks for the UI
      data.transformExprField = transformedField.replaceAll('\n', '');
    }

    // Create a deep copy of the data
    const updatedData = JSON.parse(JSON.stringify(data));
    
    // Update the data in the parent component's properties
    if (properties?.inputFileLayout?.bodyFieldDefs) {
      // Find the field by sequence number
      const fieldIndex = properties.inputFileLayout.bodyFieldDefs.findIndex(
        field => field.sequence === data.sequence
      );
      
      if (fieldIndex !== -1) {
        // Update the specific field in the parent's properties
        properties.inputFileLayout.bodyFieldDefs[fieldIndex] = updatedData;
        
        // Force change detection by creating a new array
        properties.inputFileLayout.bodyFieldDefs = [...properties.inputFileLayout.bodyFieldDefs];
      }
    }
    // Update local data
    Object.assign(data, updatedData);
    // Notify parent components through handlers
    if (handlers?.handleIsModifiedChange) {
      handlers.handleIsModifiedChange(true);
    }
    // Force a change detection
    data = {...data};
  }, [operators, handlers, properties]);

  const buttonName = useCallback(() => {
    if (data?.transformExpr?.length) {
      return 'Edit'
    } else {
      return 'Add'
    }
  }, [data]);

  const updateForm = useCallback((value: any) => {
    if (!value) {
      return;
    }
    if (value.required) {
      data.required = true;
    }
    const type: string = value.type;
    const format: string = value.format || "";
    data.dataType =
      type[0].toUpperCase() + type.substring(1).toLowerCase();
    
    if(format.includes('date')){
      data.dataType = 'Date';
    }
    if (
      !enumData.DataType.map((x: any) => x.label).includes(data.dataType)
    ) {
      data.dataType = 'String';
    }
    if (data.dataType === 'String') {
      data.minLength = value?.minLength || 1;
      data.maxLength = value?.maxLength || 100;
    }
    data.fieldName =
      !data.fieldName ||
      data.fieldName === sharedConstants.defaultFieldName ||
      rcxFieldOptions.includes(data.fieldName)
        ? data.rcxField
        : data.fieldName;
    if (handlers?.resetFormat) {
      handlers.resetFormat();
    }
    if(handlers?.resetFixedLenth) {
      handlers.resetFixedLenth();
    }
    if(handlers?.resetTransform) {
      handlers.resetTransform();
    }
  }, [data, enumData, rcxFieldOptions, handlers]);

  const updateFormGroup = useCallback((formGroup: any) => {
    formStatus(formGroup);
    formGroup.watch(() => {
      if (handlers?.handleIsModifiedChange) {
        handlers.handleIsModifiedChange(true);
      }
    });
  }, [formStatus, handlers]);

  const checkIntegrity = useCallback((formGroup: any) => {
    let { rcxField } = formGroup.getValues();
    rcxField = rcxField.split('.')[0];
    const currValue = formGroup.getValues('rcxFieldArrLen');
    let prevValue = '';
    const bodyFields = properties.inputFileLayout.bodyFieldDefs;
    const rcxFieldArrLenValues = new Set();
    bodyFields.forEach((bodyField: any) => {
      if (
        currValue != bodyField.rcxFieldArrLen &&
        bodyField.rcxField?.startsWith(rcxField)
      ) {
        prevValue = bodyField.rcxFieldArrLen;
      }
      if (
        bodyField.rcxFieldArrLen &&
        bodyField.rcxField?.startsWith(rcxField)
      ) {
        rcxFieldArrLenValues.add(bodyField.rcxFieldArrLen.toString());
      }
    });
    if (rcxFieldArrLenValues.size > 1) {
      const dialogRef = window.open('', '_blank', 'width=800,height=600');
      const ConfirmationDialogComponent = (
        <ConfirmationDialog
          data={{
            schema: 'Template',
            content: `You are modifying the ${rcxField} Fixed Array Length, Do you want to make all the ${rcxField} Fixed Array length to ${currValue}?`,
            confirmButton: 'Proceed',
            cancelButton: 'Cancel',
          }}
        />
      );
      dialogRef?.document.body.appendChild(ConfirmationDialogComponent);
      const handleConfirm = () => {
        bodyFields.forEach((bodyField: any) => {
          if (bodyField.rcxField.startsWith(rcxField)) {
            bodyField.rcxFieldArrLen = currValue;
          }
        });
      };
      const handleCancel = () => {
        formGroup.setValue('rcxFieldArrLen', prevValue);
      };
    }
  }, [properties, handlers]);

  const generateFields = useCallback(() => {
    let fields: any[] = [];
    
    const typeCondition = data?.transform === 'ArithmeticTransform' ? 'Number' :
      data?.transform === 'JoinTransform' ? 'String' : null;
    if (typeCondition) {
      fields = properties.inputFileLayout.bodyFieldDefs
        .filter((field: any, index: number) => index < data.sequence && field.dataType === typeCondition)
        .map((field: any) => field.fieldName);
    }
    return fields;
  }, [data, properties]);

  useEffect(() => {
    const getConfig = async () => {
      const config = await uiConfig.getFormViewConfig('templates');
      const ignoredRCXFields = await uiConfig.importRCXIgnoreFields();
      const rcxProcess = enumData?.['RCXProcess']?.find((e: any) => e.value === properties?.rcxProcess);
      const formattedSchema = service.getFormattedSchema(
        rcxSchemas,
        rcxProcess,
        ignoredRCXFields
      );
      setFormattedSchema(formatted