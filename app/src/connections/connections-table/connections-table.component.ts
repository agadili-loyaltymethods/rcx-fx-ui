import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ConnectionsService } from 'src/app/shared/services/connections.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { PartnersService } from 'src/app/shared/services/partners.service';
import { ProgramsService } from 'src/app/shared/services/programs.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { sharedConstants } from '../../shared';

export interface Options {
  id: string;
  name: string;
}
@Component({
  selector: 'app-connection-table',
  templateUrl: './connections-table.component.html',
  styleUrls: ['./connections-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConnectionsTableComponent implements OnInit {
  @Output() collectionValueChange = new EventEmitter();
  data: any; //should not assign default value
  getDataHandlers = {
    delete: this.delete.bind(this),
    edit: this.edit.bind(this),
    test: this.test.bind(this),
  };

  protected partnerNameOptions: Options[] = [];
  protected connectionTypeOptions: Options[] = [];
  protected connectionNameOptions: Options[] = [];
  protected connectionTestOptions: Options[] = [
    { id: '1', name: 'Valid' },
    { id: '2', name: 'Invalid' },
  ];

  protected lastUpdatedByOptions: Options[] = [];
  config: any;
  cfgOpt: any;
  dataCollection: any[];
  searchValue = '';
  selectedData: any = [];
  inputFieldValue: any[] = [];
  requiredData: any = {};

  @ViewChild('drawer') drawer;
  errors: any = [];
  refresh = false;
  originalOrder = () => 0;
  pageName = 'connections';

  constructor(
    private router: Router,
    public utilsService: UtilsService, //this is used in HTML file, please don't remove it
    private dialog: MatDialog,
    private uiConfigService: UiConfigService,
    private alertService: AlertService,
    private drawerService: DrawerService,
    private programsService: ProgramsService,
    private partnersService: PartnersService,
    private connectionsService: ConnectionsService,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getListViewConfig('connections')) || {};
    this.config.integrations =
      JSON.parse(JSON.stringify((await this.uiConfigService.getListViewConfig('integrations')) || {}));
    this.config.integrations.data = (this.config.integrations.data || []).filter(i => {
      if (i.modifySource) {
        i.source = 'connections'
      }
      if (!i?.displayPages) {
        return true;
      } else {
        return i.displayPages.includes("connections");
      }
    });
    this.refresh = this.config?.refresh ?? false;
    this.cfgOpt = this.config.filterOptions;
    this.config.filters = {};
    await this.getData();
    this.requiredData.selectedData = this.selectedData || [];
    this.drawerService.setDrawerState(false);
  }

  async getRefreshData() {
    await this.getListData();
  }

  async getData() {
    await this.getFilterData();
    await this.getListData();
  }

  async getFilterData() {
    try {
      const enumsQuery = {
        query: JSON.stringify({
          type: 'ConnectionType',
          lang: 'en',
        }),
        select: 'label,value',
      };

      this.config['Connection Test Status'] = this.connectionTestOptions;
      const enums = await firstValueFrom(
        this.programsService.getEnums(enumsQuery),
      );

      this.getDropDownEnums(enums);
      const allPartners = await firstValueFrom(
        this.partnersService.getPartners({}),
      );

      this.getPartnerNameOptions(allPartners);
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getListData() {
    try {
      const userDetail = await this.authService.getUser();
      const partner = userDetail.partner || '';
      const partnerQuery: any = {
        populate: JSON.stringify([
          { path: 'partner', select: 'name' },
          { path: 'updatedBy', select: 'login' },
        ]),
      };

      if (partner) {
        partnerQuery.query = JSON.stringify({ partner });
      }
      const s3Data = await firstValueFrom(
        this.connectionsService.getConnections('s3', partnerQuery),
      );
      const sftpData = await firstValueFrom(
        this.connectionsService.getConnections('sftp', partnerQuery),
      );

      this.data = [...s3Data, ...sftpData];
      this.dataCollection = this.data;
      this.getConnectionNameOptions(this.data);
      this.getUpdatedByOptions(this.data);
      this.utilsService.filterListData(this);
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getAllConnections() {
    const partnerQuery: any = {
      populate: JSON.stringify([
        { path: 'partner', select: 'name' },
        { path: 'updatedBy', select: 'login' },
      ]),
    };

    if (
      this.config &&
      this.config.queryOptions &&
      this.config.queryOptions.sort
    ) {
      partnerQuery.sort = JSON.stringify(this.config.queryOptions.sort);
    }
    try {
      const s3Data = await firstValueFrom(
        this.connectionsService.getConnections('s3', partnerQuery),
      );
      const sftpData = await firstValueFrom(
        this.connectionsService.getConnections('sftp', partnerQuery),
      );
      const data = [...s3Data, ...sftpData];

      data.forEach((connection) => {
        connection.encAndComp =
          (connection.encryptionEnabled ? 'Y' : 'N') +
          '/' +
          (connection.compressionEnabled ? 'Y' : 'N');
      });

      return data;
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  getPartnerNameOptions(partners) {
    this.partnerNameOptions = partners.map((p) => {
      return { name: p.name, id: p._id };
    });
    this.config['Partner'] = this.partnerNameOptions;
  }

  getDropDownEnums(enums) {
    this.connectionTypeOptions = enums.map((e) => {
      return { name: e.value, id: e._id };
    });
    this.config['Connection Type'] = this.connectionTypeOptions;
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

  getConnectionNameOptions(data) {
    for (const i of data) {
      const connectionNameArray = this.connectionNameOptions.map(
        (obj) => obj.name,
      );
      const connectionNameSet = new Set(connectionNameArray);
      const uniqueConnectionNameArray = Array.from(connectionNameSet);

      if (!uniqueConnectionNameArray.includes(i.name)) {
        const connectionNameObj = {
          name: i.name,
          id: i._id,
        };

        this.connectionNameOptions.push(connectionNameObj);
      }
    }
    this.config['Connection Name'] = this.connectionNameOptions;
  }

  edit() {
    // Perform edit action for the row
  }

  delete(row: any): void {
    // Perform delete action for the row
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        schema: 'Delete Connection',
        content: `Are you sure that you want to delete <strong>${row.name}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        confirmation: this.confirmationDialog.bind(this),
      },
    });
  }

  async confirmationDialog(row) {
    try {
      await firstValueFrom(this.connectionsService.deleteConnections(row));
      this.alertService.successAlert('Connection deleted successfully');
      this.getListData();
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || 'Cannot delete connection',
      );
    }
  }

  createConnection() {
    this.router.navigate(['connections/create']);
  }

  callBack() {
    /** Add callback logic here */
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

  async test(row) {
    try {
      let dataCopy: any = JSON.stringify(row);
      const formData = new FormData();     
      formData.append('data', dataCopy);
      let data = await firstValueFrom(
        this.connectionsService.connectionsValidate(formData),
      );

      if (data) {
        data = {
          ...data,
          type: 'successDialog',
          schema: 'Connection Established',
          message: 'Test Successful',
          disableCancelButton: true,
          confirmButton: 'Ok',
        };
        this.dialog.open(ConfirmationDialog, {
          data: data,
        });
      }
    } catch (err) {
      let error: any = '';
      const errorMessage =
        err.errorMessage || sharedConstants.defaultErrorMessage;

      if (err.errorCode === 1508) {
        const errKeys = Object.keys(err.errors || {});

        error = errKeys.map((key) => {
          return { key: key, value: err.errors[key] };
        });
      }
      const data = {
        schema: 'Connection Failed',
        disableCancelButton: true,
        confirmButton: 'Ok',
      };

      if (error) {
        data['content'] = error;
        data['type'] = 'errorDialog';
      } else {
        data['content'] = errorMessage;
      }
      this.dialog.open(ConfirmationDialog, {
        data: data,
      });
    }
    await this.getListData();
  }
}
