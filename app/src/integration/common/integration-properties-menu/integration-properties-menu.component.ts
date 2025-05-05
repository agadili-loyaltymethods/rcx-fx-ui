import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-integration-properties-menu',
  templateUrl: './integration-properties-menu.component.html',
  styleUrls: ['./integration-properties-menu.component.scss'],
})
export class IntegrationPropertiesMenuComponent {
  @Input() onMenuClick: Function;
  @Input() properties;
  @Input() isvalidForm: boolean;
  @Input() isView = false;
  @Output() validateForm: EventEmitter<string> = new EventEmitter<string>();
  activeMenuProperties = 'integration_properties';
  constructor(private alertService: AlertService) {}

  onClickOnMenuSelection(value: string) {
    if (!this.isvalidForm && !this.isView) {
      this.validateForm.emit();
      this.alertService.infoAlert('Please fill all required fields.', '');

      return;
    }
    this.activeMenuProperties = value;
    this.onMenuClick(value);
  }
}
