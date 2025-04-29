import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-scheduling-properties',
  templateUrl: './scheduling-properties.component.html',
  styleUrls: ['./scheduling-properties.component.scss'],
})
export class SchedulingPropertiesComponent {
  @Input() data;
  @Input() handlers;
  @Input() properties;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  options: any = ['Option1', 'Option2', 'Option3'];

  config: any;
  requiredData: any = {};

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getFormViewConfig('integrations')) || {};
    this.requiredData.FrequencyType =
      this.handlers.getEnumsByType('FrequencyType');
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formStatus.emit(formGroup);
    formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }
}
