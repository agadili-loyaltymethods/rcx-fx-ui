import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  InputProperties,
  ResponseProperties,
} from 'src/app/models/integration';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-integration-properties',
  templateUrl: './integration-properties.component.html',
  styleUrls: ['./integration-properties.component.scss'],
})
export class IntegrationPropertiesComponent {
  @Input() properties;
  @Input() handlers;
  @Input() partners;
  @Input() templates;
  @Input() isView;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  filteredPartners = [];
  config: any;
  requiredData: any = {};
  formGroup: FormGroup = new FormGroup([]);

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    this.filteredPartners = this.partners || [];
    this.config =
      (await this.uiConfigService.getFormViewConfig('integrations')) || {};
    this.properties = this.properties || {};
    if (this.properties?.partner) {
      this.properties.partner =
        this.properties.partner?._id || this.properties.partner;
    }
    if (this.properties?.template) {
      this.properties.template =
        this.properties.template?._id || this.properties.template;
    }
    this.handlers.PartnerChange = this.onPartnerChange.bind(this);
  }

  filterPartners(searchTerm: string) {
    return this.partners.filter((partner) =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  ngOnChanges() {
    this.requiredData.Partners = this.partners;
    this.requiredData.templates = this.templates;
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formGroup = formGroup;
    this.formGroup.controls['partnerFormControl']?.valueChanges.subscribe(
      (searchTerm) => {
        this.requiredData.Partners = this.filterPartners(searchTerm);
      },
    );
    this.requiredData.partnerFormControl =
      this.formGroup.controls['partnerFormControl'];
    this.formStatus.emit(formGroup);
    this.formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }

  onPartnerChange() {
    this.formGroup.get('template').setValue('');
    this.properties.inputProperties = new InputProperties();
    this.properties.responseProperties = new ResponseProperties();
    this.handlers.getTemplatesByParnter();
  }
}
