import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { sharedConstants } from 'src/app/shared';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-response-footer-properties',
  templateUrl: './response-footer-properties.component.html',
  styleUrls: ['./response-footer-properties.component.scss'],
})
export class ResponseFooterPropertiesComponent {
  @Input() properties;
  @Input() activeFieldDetails;
  @Input() data;
  @Input() enumData;
  @Input() handlers;
  @Input() valueFields;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  valueOptions = [];
  config: any;

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getFormViewConfig('templates')) || {};
    this.addHandler();
  }

  ngOnChanges() {
    this.data = this.data || {};
    this.enumData = this.enumData || {};
    this.enumData.MathFuncs = this.enumData.MathFuncs || [];
    this.enumData.DataType = this.enumData.DataType || [];
    this.getValues();
  }

  getValues() {
    const values = ['Error Code', 'Error Message', 'HTTP Status', 'Constant', 'Row Number'];
    if (this.properties.rcxProcess === 'Activity') {
      values.push('ActivityId')
    }
    this.valueOptions = values;
    this.enumData.valueOptions = this.valueOptions || [];
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formStatus.emit(formGroup);
    formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }

  addHandler() {
    this.handlers.handleFieldNameUpdate = this.handleFieldNameUpdate.bind(this);
  }

  handleFieldNameUpdate(formGroup: FormGroup) {
    if (
      (!formGroup.get('filedName')?.value ||
        formGroup.get('fieldName')?.value ===
          sharedConstants.defaultFieldName ||
        this.valueOptions.includes(this.data.fieldName)) &&
      this.data.value
    ) {
      formGroup.get('fieldName').setValue(this.data.value);
    }
  }
}
