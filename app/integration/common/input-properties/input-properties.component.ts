import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-input-properties',
  templateUrl: './input-properties.component.html',
  styleUrls: ['./input-properties.component.scss'],
})
export class InputPropertiesComponent {
  @Input() data;
  @Input() handlers;
  @Input() properties;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  connections = [];
  config: any;
  requiredData: any = {};

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    // if (this.data.connectionType) {
    this.config =
      (await this.uiConfigService.getFormViewConfig('integrations')) || {};
    this.connections = this.handlers.getConnectionsByParnter();
    this.requiredData.connections = this.connections;
    // }
  }

  onConnectionTypeChange() {
    this.data.connection = '';
    this.connections = this.handlers.getConnectionsByParnter();
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formStatus.emit(formGroup);
    formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }
}
