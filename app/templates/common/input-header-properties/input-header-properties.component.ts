import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-input-header-properties',
  templateUrl: './input-header-properties.component.html',
  styleUrls: ['./input-header-properties.component.scss'],
})
export class InputHeaderPropertiesComponent {
  @Input() properties;
  @Input() activeFieldDetails;
  @Input() data;
  @Input() enumData;
  @Input() handlers;
  config: any;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getFormViewConfig('templates')) || {};
  }

  ngOnChanges() {
    this.data = this.data || {};
    this.enumData = this.enumData || {};
    this.enumData.DataType = this.enumData.DataType || [];
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formStatus.emit(formGroup);
    formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }
}
