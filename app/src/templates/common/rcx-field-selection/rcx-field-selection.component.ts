import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-rcx-field-selection',
  templateUrl: './rcx-field-selection.component.html',
  styleUrls: ['./rcx-field-selection.component.scss'],
})
export class RcxFieldSelectionComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  options: RCXFieldModel[] = [];
  filteredOptions: RCXFieldModel[] = [];
  selectedField: RCXFieldModel;
  rcxProcessLabel: string = this.data?.properties?.rcxProcess;

  async ngOnInit() {
    this.options = this.data?.formattedSchema || [];
    this.filteredOptions = JSON.parse(JSON.stringify(this.options));
    if (this.data?.rowData?.rcxField) {
      this.selectedField = this.filteredOptions.find(
        (f) => f.value === this.data?.rowData?.rcxField,
      );
    }
      const matchingEnum = this.data.enumData.RCXProcess.find(
        (enumItem) => enumItem.value === this.rcxProcessLabel,
      );

      if (matchingEnum) {
        this.rcxProcessLabel= matchingEnum.label;
      }
    }

  selectField(field: RCXFieldModel) {
    this.selectedField = field;
  }

  ok() {
    if (this.data?.rowData) {
      this.data.rowData.rcxField = this.selectedField?.value;
      if (this.selectedField?.parentType === 'array') {
        this.data.rowData.parentType = 'array';
        this.data.rowData.arrField = this.selectedField?.arrField;
      } else {
        delete this.data.rowData?.rcxFieldArrLen;
        delete this.data.rowData.parentType;
        delete this.data.rowData.arrField;
      }
    }
    if (this.data?.handlers?.updateForm) {
      this.data.handlers.updateForm(this.selectedField);
    }
  }

  filterData(event) {
    const value = event.target.value;

    this.filteredOptions = this.options.filter(
      (x) => x?.label?.toLowerCase()?.indexOf(value?.toLowerCase()) > -1,
    );
    if (this.data?.rowData?.rcxField) {
      this.selectedField = this.filteredOptions.find(
        (f) => f.value === this.data?.rowData?.rcxField,
      );
    }
  }
}

export class RCXFieldModel {
  value: string;
  label: string;
  type: string;
  parentType: string;
  required: boolean;
  minLength: number;
  maxLength: number;
  arrField: string;
}
