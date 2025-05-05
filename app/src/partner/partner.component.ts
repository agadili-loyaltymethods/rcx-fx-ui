import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { ConfirmationDialog } from '../common-components/delete-button/confirmation-dialog.component';
import { sharedConstants } from '../shared';
import { AlertService } from '../shared/services/alert.service';
import { PartnersService } from '../shared/services/partners.service';
import { ProgramsService } from '../shared/services/programs.service';
import { UtilsService } from '../shared/services/utils.service';

export interface Options {
  id: string;
  name: string;
}
@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PartnerComponent implements OnInit {
  data: any; //should not assign default value
  config: any;
  cfgOpt: any;
  dataCollection: any[] = [];
  inputFieldValue: any[] = [];
  searchValue: any;
  refresh = false;
  pageName = 'partners';
  getDataHandler = {
    delete: this.delete.bind(this),
    edit: this.edit.bind(this),
    editUser: this.editUser.bind(this),
    deleteUser: this.deleteUser.bind(this),
  };

  protected partnerTypeOptions: Options[] = [];
  protected lastUpdatedByOptions: Options[] = [];
  protected partnerNameOptions: Options[] = [];
  constructor(
    public utilsService: UtilsService, //this is used in HTML file, please don't remove it
    private uiConfigService: UiConfigService,
    private router: Router,
    private alertService: AlertService,
    public dialog: MatDialog,
    private partnersService: PartnersService,
    private programsService: ProgramsService,
  ) {}

  originalOrder = () => 0;

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getListViewConfig('partners')) || {};
    this.config.filters = {};
    this.cfgOpt = this.config.filterOptions;
    this.refresh = this.config?.refresh ?? false;

    await this.getData();
  }

  async getData() {
    await this.getFilterData();
    await this.getListData();
  }

  async getRefreshData() {
    await this.getListData();
  }

  async getFilterData() {
    try {
      const query = {
        query: JSON.stringify({
          type: 'PartnerType',
          lang: 'en',
        }),
        select: 'label,value',
      };

      const enums = await firstValueFrom(this.programsService.getEnums(query));
      this.getDropDownEnums(enums);
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getListData() {
    try {
      await this.callHandler();
      this.getUpdatedByOptions(this.data);
      this.utilsService.filterListData(this);
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  getDropDownEnums(enums) {
    this.partnerTypeOptions = enums.map((e) => {
      return { name: e.value, id: e._id };
    });
    this.config['Partner Type'] = this.partnerTypeOptions;
  }

  getUpdatedByOptions(data) {
    for (const i of data) {
      const updatedByArray = this.lastUpdatedByOptions.map((obj) => obj.name);
      const uniqueUpdatedBySet = new Set(updatedByArray);
      const uniqueUpdatedByArray = Array.from(uniqueUpdatedBySet);

      if (!uniqueUpdatedByArray.includes(i.updatedBy?.login)) {
        const updatedByObj = {
          name: i.updatedBy?.login,
          id: i.updatedBy?._id,
        };

        this.lastUpdatedByOptions.push(updatedByObj);
      }
    }
    this.config['Last Updated By'] = this.lastUpdatedByOptions;
  }

  getPartnerNameOptions(partners) {
    this.partnerNameOptions = partners.map((p) => {
      return { name: p.name, id: p._id };
    });
    this.config['Partner'] = this.partnerNameOptions;
  }

  createPartner() {
    this.router.navigate(['partners/create']);
  }

  edit(row: any): void {
    // Perform edit action for the row
    this.router.navigate([`partners/edit/${row._id}`]);
  }

  delete(row: any): void {
    // Perform delete action for the row
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

  async confirmationDialog(row) {
    try {
      await firstValueFrom(this.partnersService.deletePartner(row));
      this.alertService.successAlert('Partner deleted successfully');
      this.getListData();
    } catch (err) {
      this.alertService.errorAlert(err.errorMessage || 'Cannot delete partner');
    }
  }

  editUser(row: any): void {
    // Perform edit action for the row
    this.router.navigate([`users/edit/${row._id}`], { state: row });
  }

  deleteUser(row: any): void {
    // Perform delete action for the row
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        schema: 'Delete User',
        content: `Are you sure that you want to delete <strong>${row.login}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        confirmation: this.confirmationDialogUser.bind(this),
      },
    });
  }

  async confirmationDialogUser(row) {
    try {
      await firstValueFrom(this.partnersService.deleteUser(row));
      this.alertService.successAlert('user deleted successfully');
      this.getListData();
    } catch (err) {
      this.alertService.errorAlert(err.errorMessage || 'Cannot delete user');
    }
  }

  onChange(options) {
    this.utilsService.onChange(this, options);
  }

  resetFilters() {
    this.utilsService.resetFilters(this, this.pageName);
  }

  getSelectedValue(list = [], fieldName) {
    const filters = this.config.filters[fieldName] || [];
    return list.filter(l => filters.includes(l.name));
  }

  async callHandler() {
    const params: any = {
      populate: JSON.stringify([
        { path: 'updatedBy', select: 'login' },
        { path: 'program' },
      ]),
    };

    this.data = await firstValueFrom(this.partnersService.getPartners(params));
    if (
      this.config &&
      this.config.queryOptions &&
      this.config.queryOptions.sort
    ) {
      params.sort = JSON.stringify(this.config.queryOptions.sort);
    }
    this.dataCollection = this.data;
    this.getPartnerNameOptions(this.data);
  }
}
