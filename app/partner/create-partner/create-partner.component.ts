import { Location } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { Partner } from '../../models/partner';
import { sharedConstants } from '../../shared';
import { AlertService } from '../../shared/services/alert.service';
import { PartnersService } from '../../shared/services/partners.service';
import { UiConfigService } from '../../shared/services/ui-config.service';
import { ProgramsService } from './../../shared/services/programs.service';

export interface ICountryAndCode {
  code: string;
  name: string;
}
@Component({
  selector: 'app-create-partner',
  templateUrl: './create-partner.component.html',
  styleUrls: ['./create-partner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreatePartnerComponent {
  formGroup: FormGroup = new FormGroup([]);
  data: any;
  routeSub: Subscription;
  isEdit = false;
  partnerAction: any;
  enumData: any = {};
  program = [];
  config: any;
  isModified: any;
  timeZoneOptions: any;
  partnerTypeOptions: any;
  sub: Subscription;
  partnerId: any;
  deletePermission: boolean;

  constructor(
    private partnersService: PartnersService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private uiConfigService: UiConfigService,
    private programsService: ProgramsService,
    public dialog: MatDialog,
    private location: Location,
    public utilService: UtilsService,
  ) {}

  async ngOnInit() {
    this.sub = this.route.paramMap.subscribe((params) => {
      this.partnerId = params.get("id");
    });
    await this.getCurrentPartner(this.partnerId);
    // this.data = history.state || new Partner();
    if (!this.data.isHostingPartner) {
      this.data.isHostingPartner = false;
    }
    if (!this.data.timezone) {
      this.data.timezone = 'UTC'
    }
    this.config =
      (await this.uiConfigService.getFormViewConfig('partners')) || {};
    this.data.program = this.data.program?._id || this.data.program;
    this.routeSub = this.route.url.subscribe((url) => {
      this.isEdit = url[0]?.path === 'edit';
      this.partnerAction = url[0]?.path;
    });
    this.config.commonProperties =
      await this.uiConfigService.importCommonProperties();

    await this.getData();
    this.timeZoneOptions = this.enumData.timeZone
    this.partnerTypeOptions = this.enumData.PartnerType
    this.deletePermission = await this.utilService.checkPerms({FX_Partner: ['delete']})
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.sub.unsubscribe();
  }
  
  async getCurrentPartner(id) {
    if (!id) {
      this.data = {};
      return;
    }
    let data = [];
    try {
      let query = JSON.stringify({ _id: id })
      data = await firstValueFrom(this.partnersService.getPartners({ query }));
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
    this.data = data[0] || {};
  }
  handleIsModifiedChange(isModified: boolean) {
    this.isModified = isModified;
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (!this.isModified) {
      return true;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        schema: 'Unsaved Changes',
        content: `There are unsaved changes. Exit without saving?`,
        confirmButton: 'Proceed',
        cancelButton: 'Cancel',
      },
    });

    return dialogRef.afterClosed();
  }

  edit(row: any): void {
    this.router.navigate([`partners/edit/${row._id}`]);
  }

  delete(row: any): void {
    if (!this.deletePermission) {
      return;
    }
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        schema: 'Delete Partner',
        content: `Are you sure that you want to delete <strong>${row.name}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        confirmation: this.confirmationDialog.bind(this),
      },
    });
  }

  navigate() {
    if (history.state?.source !== 'partners') {
      this.location.back();
    } else {
      this.router.navigate(['partner/list']);
    }
  }

  async confirmationDialog(row) {
    try {
      await firstValueFrom(this.partnersService.deletePartner(row));
      this.alertService.successAlert('Partner deleted successfully');
      this.isModified = false;
      this.navigate();
    } catch (err) {
      this.alertService.errorAlert(err.errorMessage || 'Cannot delete partner');
    }
  }

  async getData() {
    const query = {
      query: JSON.stringify({
        type: { $in: ['PartnerType', 'timeZone', 'PartnerStat'] },
        lang: 'en',
      }),
      select: 'label,type,value',
    };

    try {
      this.program = await firstValueFrom(
        this.programsService.getProgramDetails(),
      );
    } catch (err) {
      this.alertService.errorAlert(err.errorMessage);
    }
    const enums = await firstValueFrom(this.programsService.getEnums(query));

    for (const x of enums) {
      if (!this.enumData[x.type]) {
        this.enumData[x.type] = [];
      }
      this.enumData[x.type].push(x);
    }
    this.enumData.program = this.program;
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formGroup = formGroup;
    this.formGroup.controls['partnerFormControl']?.valueChanges.subscribe(
      (searchTerm) => {
        this.enumData.PartnerType = this.filterOptions(searchTerm, this.partnerTypeOptions);
      },
    );
    this.formGroup.controls['timeZoneFormControl']?.valueChanges.subscribe(
      (searchTerm) => {
        this.enumData.timeZone = this.filterOptions(searchTerm, this.timeZoneOptions);
      },
    );
  }
  ngOnChanges() {
    this.enumData.timeZone = this.timeZoneOptions || [];
    this.enumData.PartnerType = this.partnerTypeOptions || [];
  }

  filterOptions(searchTerm: string, options) {
    return options.filter((timezone) =>
        timezone.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }
  async savePartner() {
    this.isModified = false;
    try {
      await firstValueFrom(
        this.partnersService.updatePartner(this.data, this.isEdit),
      );
      this.alertService.successAlert('Partner saved successfully');
      this.router.navigate(['partners']);
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || sharedConstants.defaultErrorMessage,
      );
    }
  }
}
