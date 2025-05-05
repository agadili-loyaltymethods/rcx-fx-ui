import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-input-file-properties',
  templateUrl: './input-file-properties.component.html',
  styleUrls: ['./input-file-properties.component.scss'],
})
export class InputFilePropertiesComponent {
  @Input() data;
  @Input() isView = false;
  @Input() activeFieldDetails;
  @Input() handlers;
  @Input() properties;
  config: any;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getFormViewConfig('templates')) || {};
  }

  ngOnChanges() {
    this.data = this.data || {};
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formStatus.emit(formGroup);
    formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }
}
