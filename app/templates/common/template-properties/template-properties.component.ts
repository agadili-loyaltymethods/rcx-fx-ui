import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-template-properties',
  templateUrl: './template-properties.component.html',
  styleUrls: ['./template-properties.component.scss'],
})
export class TemplatePropertiesComponent {
  @Input() properties;
  @Input() partners;
  @Input() enumData;
  @Input() handlers;
  @Output() formStatus: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  options = ['String', 'Number'];
  filteredPartners = [];
  config: any;
  formGroup: FormGroup = new FormGroup([]);

  constructor(private uiConfigService: UiConfigService) {}

  async ngOnInit() {
    // this.filteredPartners = this.partners || [];
    this.config =
      (await this.uiConfigService.getFormViewConfig('templates')) || {};
    this.properties = this.properties || {};
    if (this.properties?.partner) {
      this.properties.partner =
        this.properties.partner?._id || this.properties.partner;
    }
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formGroup = formGroup;
    this.formGroup.controls['partnerFormControl']?.valueChanges.subscribe(
      (searchTerm) => {
        this.enumData.partners = this.filterPartners(searchTerm);
      },
    );
    this.enumData.partnerFormControl =
      this.formGroup.controls['partnerFormControl'];
    this.formStatus.emit(formGroup);
    this.formGroup.valueChanges.subscribe(() => {
      this.handlers.handleIsModifiedChange(true);
    });
  }

  ngOnChanges() {
    this.enumData.partners = this.partners || [];
  }

  filterPartners(searchTerm: string) {
    return this.partners.filter((partner) =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    // this.enumData.Partner = this.partners || [];
  }

  resetRCXFields() {
    (
      ((this.properties || {}).inputFileLayout || {}).bodyFieldDefs || []
    ).forEach((def) => {
      def.rcxField = '';
    });
  }
}
