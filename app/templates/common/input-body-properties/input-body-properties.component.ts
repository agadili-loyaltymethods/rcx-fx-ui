import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import { Service } from 'src/app/shared/services/service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { sharedConstants } from '../../../shared';
import { RcxFieldSelectionComponent } from '../rcx-field-selection/rcx-field-selection.component';
import { TreeViewModalComponent } from 'src/app/common-components/tree-view-modal/tree-view-modal.component';

@Component({
  selector: 'app-input-body-properties',
  templateUrl: './input-body-properties.component.html',
  styleUrls: ['./input-body-properties.component.scss'],
})
export class InputBodyPropertiesComponent {
  @Input() data;
  @Input() properties;
  @Input() enumData;
  @Input() activeFieldDetails;
  @Input() handlers;
  @Input() isView = false;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @Input() rcxSchemas = {};
  formattedSchema = [];
  config: any;
  fields: any =[];
  rcxFieldOptions: string[] = [];
  rowData: any;
  operators: any = ['+', '-', '*', '/', '%'];
  constructor(
    public dialog: MatDialog,
    private uiConfigService: UiConfigService,
    private service: Service,
  ) {}

  openRCXFieldDialog(rowData) {
    const _self = this;

    this.dialog.open(RcxFieldSelectionComponent, {
      data: {
        rowData,
        formattedSchema: this.formattedSchema,
        properties: this.properties,
        enumData: this.enumData,
        handlers: {
          updateForm: _self.updateForm.bind(_self),
        },
      },
    });
  }

  openTreeViewModal(rowData) {
    const _self = this;
    this.dialog.open(TreeViewModalComponent, {
      data: {
        rowData,
        formattedSchema: this.formattedSchema,
        properties: this.properties,
        enumData: this.enumData,
        handlers: {
          addTransform: _self.addTransform.bind(_self),
        },
        fields: this.fields,
        cancelButton: 'No',
      },
    });
  }
    

  addTransform (data) { 
    if (this.data.transform === 'MappingTransform') {
      this.data.transformExpr = data;
      this.data.transformExprField = data;
    } else {
      let transformedField = '';
      // Create a copy of the data array without the 'Add' node
      const processData = [...data].filter(node => node.item !== 'Add');
      
      processData.forEach(field => {
        if (field.inputType === 'customText' || (this.data.transform === 'ArithmeticTransform' && this.operators.includes(field.item))) {
            transformedField += field.item + '\n';
        } else if(field.inputType === 'dropDown') {
            transformedField += '${' + field.item + '}'
        } 
    
      });
      
      // Store the original transformExpr with line breaks
      this.data.transformExpr = transformedField;
      
      // Create a display version without line breaks for the UI
      this.data.transformExprField = transformedField.replaceAll('\n', '');
    }


    // Create a deep copy of the data
    const updatedData = JSON.parse(JSON.stringify(this.data));
    
    // Update the data in the parent component's properties
    if (this.properties?.inputFileLayout?.bodyFieldDefs) {
      // Find the field by sequence number
      const fieldIndex = this.properties.inputFileLayout.bodyFieldDefs.findIndex(
        field => field.sequence === this.data.sequence
      );
      
      if (fieldIndex !== -1) {
        // Update the specific field in the parent's properties
        this.properties.inputFileLayout.bodyFieldDefs[fieldIndex] = updatedData;
        
        // Force change detection by creating a new array
        this.properties.inputFileLayout.bodyFieldDefs = [...this.properties.inputFileLayout.bodyFieldDefs];
      }
    }

    // Update local data
    Object.assign(this.data, updatedData);

    // Notify parent components through handlers
    if (this.handlers?.handleIsModifiedChange) {
      this.handlers.handleIsModifiedChange(true);
    }

    // Force a change detection
    this.data = {...this.data};
  }

  buttonName () {
    if (this.data?.transformExpr?.length) {
      return 'Edit'
    } else {
      return 'Add'
    }
  }

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getFormViewConfig('templates')) || {};
    this.handlers.openRCXFieldDialog = this.openRCXFieldDialog.bind(this);
    this.handlers.openTreeViewModal = this.openTreeViewModal.bind(this);
    this.handlers.checkIntegrity = this.checkIntegrity.bind(this);
    this.handlers.buttonName = this.buttonName.bind(this);
    const ignoredRCXFields = await this.uiConfigService.importRCXIgnoreFields();
    const rcxProcess = this.enumData?.['RCXProcess']?.find(e => e.value === this.properties?.rcxProcess);
    this.formattedSchema = this.service.getFormattedSchema(
      this.rcxSchemas,
      rcxProcess,
      ignoredRCXFields
    );
    this.rcxFieldOptions = this.formattedSchema.map((field) => field.label);
    
    // Preserve the original transformExpr with line breaks
    // Create a display version without line breaks for the UI
    if (this.data.transformExpr?.length) { 
      this.data.transformExprField = this.data.transformExpr.replaceAll('\n', '');
    }
  }
  
  ngOnChanges() {
    this.data = this.data || {};
    this.enumData = this.enumData || {};
    this.enumData.DataType = this.enumData.DataType || [];
    this.enumData.FieldJoinTransform = this.generateFields() || [];
    
    // Preserve the original transformExpr with line breaks
    // Create a display version without line breaks for the UI
    if (this.data.transformExpr?.length) { 
      this.data.transformExprField = this.data.transformExpr.replaceAll('\n', '');
    }
  }

  generateFields() {
    this.fields = [];
    
    const typeCondition = this.data?.transform === 'ArithmeticTransform' ? 'Number' :
      this.data?.transform === 'JoinTransform' ? 'String' : null;

    if (typeCondition) {
      this.fields = this.properties.inputFileLayout.bodyFieldDefs
        .filter((field, index) => index < this.data.sequence && field.dataType === typeCondition)
        .map(field => field.fieldName);
    }

    return this.fields;
  }

  updateForm(value) {
    if (!value) {
      return;
    }
    if (value.required) {
      this.data.required = true;
    }
    const type: string = value.type;
    const format: string = value.format || "";

    this.data.dataType =
      type[0].toUpperCase() + type.substring(1).toLowerCase();
    
    if(format.includes('date')){
      this.data.dataType = 'Date';
    }
    if (
      !this.enumData.DataType.map((x) => x.label).includes(this.data.dataType)
    ) {
      this.data.dataType = 'String';
    }
    if (this.data.dataType === 'String') {
      this.data.minLength = value?.minLength || 1;
      this.data.maxLength = value?.maxLength || 100;
    }
    this.data.fieldName =
      !this.data.fieldName ||
      this.data.fieldName === sharedConstants.defaultFieldName ||
      this.rcxFieldOptions.includes(this.data.fieldName)
        ? this.data.rcxField
        : this.data.fieldName;
    if (this.handlers?.resetFormat) {
      this.handlers.resetFormat();
    }
    if(this.handlers?.resetFixedLenth) {
      this.handlers.resetFixedLenth();
    }
    if(this.handlers?.resetTransform) {
      this.handlers.resetTransform();
    }
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formStatus.emit(formGroup);
    formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }

  checkIntegrity(formGroup: FormGroup) {
    let { rcxField } = formGroup.value || '';

    rcxField = rcxField.split('.')[0];
    const currValue = formGroup.get('rcxFieldArrLen')?.value;
    let prevValue = '';

    const bodyFields = this.properties.inputFileLayout.bodyFieldDefs;
    const rcxFieldArrLenValues = new Set();

    bodyFields.forEach((bodyField) => {
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
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        data: {
          schema: 'Template',
          content: `You are modifying the ${rcxField} Fixed Array Length, Do you want to make all the ${rcxField} Fixed Array length to ${currValue}?`,
          confirmButton: 'Proceed',
          cancelButton: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          bodyFields.forEach((bodyField) => {
            if (bodyField.rcxField.startsWith(rcxField)) {
              bodyField.rcxFieldArrLen = currValue;
            }
          });
        } else {
          formGroup.get('rcxFieldArrLen').setValue(prevValue);
        }
      });
    }
  }
}
