import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { sharedConstants } from '../shared';
import { AlertService } from '../shared/services/alert.service';
import { AuthService } from '../shared/services/auth.service';
import { ConnectionsService } from '../shared/services/connections.service';
import { IntegrationUtilsService } from '../shared/services/integration-utils.service';
import { IntegrationsService } from '../shared/services/integrations.service';
import { PartnersService } from '../shared/services/partners.service';
import { ProgramsService } from '../shared/services/programs.service';
import { Service } from '../shared/services/service';
import { TemplatesService } from '../shared/services/templates.service';

export interface Options {
  id: string;
  name: string;
}
@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IntegrationComponent implements OnInit {
  showListView = true;
  data: any; //should not assign default value
  integrationName: any[] = [];
  partnerName: any[] = [];
  config: any;
  cfgOpt: any;
  inputFieldValue: any = [];
  dataCollection: any[] = [];
  searchValue = '';
  refresh = false;
  enumOptions: any;
  enumData: any = {};
  pageName = 'integrations';

  getDataHandler = {
    copyIntegration: this.integrationUtilsService.copyIntegration.bind(this),
    runOnceIntegration: this.integrationUtilsService.runOnceIntegration.bind(this),
    editIntegration: this.integrationUtilsService.editIntegration.bind(this.integrationUtilsService),
    deleteIntegration: this.deleteIntegration.bind(this),
    resumeIntegration: this.resumeIntegration.bind(this),
    pauseIntegration: this.pauseIntegration.bind(this),
    publishIntegration: this.publishIntegration.bind(this),
    unpublishIntegration: this.unpublishIntegration.bind(this)
  };

  originalOrder = () => 0;

  protected partnerNameOptions: Options[] = [];
  protected integrationNameOptions: Options[] = [];
  protected templateNameOptions: Options[] = [];
  protected connectionNameOptions: Options[] = [];
  protected rcxProcessOptions: Options[] = [];
  protected rcxStatusOptions: Options[] = [];

  constructor(
    private service: Service,
    public utilsService: UtilsService, //this is used in HTML file, please don't remove it
    private uiConfigService: UiConfigService,
    public dialog: MatDialog,
    private integrationUtilsService: IntegrationUtilsService,
    private integrationsService: IntegrationsService,
    private connectionsService: ConnectionsService,
    private authService: AuthService,
    private programsService: ProgramsService,
    private partnersService: PartnersService,
    private templatesService: TemplatesService,

    private alertService: AlertService, //this is used in integration utils service don't remove
  ) {}

  async ngOnInit() {
    this.showListView = this.service.getComponentView('integrationListView');
    this.config =
      (await this.uiConfigService.getListViewConfig('integrations')) || {};
    this.refresh = this.config?.refresh ?? false;
    this.cfgOpt = this.config.filterOptions;
    this.config.filters = {};
    await this.getData();
  }

  async getRefreshData() {
    await this.getListData();
  }

  async getFilterData() {
    const query = {
      query: JSON.stringify({
        type: { $in: ['RCXProcess', 'IntegrationStatus'] },
        lang: 'en',
      }),
      select: 'label,type,value',
    };

    try {
      const enums = await firstValueFrom(this.programsService.getEnums(query));

      for (const x of enums) {
        if (!this.enumData[x.type]) {
          this.enumData[x.type] = [];
        }
        this.enumData[x.type].push(x);
      }
      this.getDropDownEnums(this.enumData.RCXProcess, 'RCX Process');
      this.getDropDownEnums(this.enumData.IntegrationStatus, 'Status');
      const allPartners = await firstValueFrom(
        this.partnersService.getPartners({}),
      );

      this.getPartnersOptions(allPartners);
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  getRcxprocessLabels(data) {
    this.data?.forEach((item) => {
      const matchingEnum = data?.find(
        (enumItem) => enumItem.value === item?.template?.rcxProcess,
      );

      if (matchingEnum) {
        item.template.rcxProcess = matchingEnum.label;
      }
    });
  }

  async getListData() {
    try {
      const userDetail = await this.authService.getUser();
      const partner = userDetail.partner || '';
      const query: any = {
        populate: JSON.stringify([
          { path: 'updatedBy', select: 'login' },
          { path: 'program' },
          { path: 'template' },
          { path: 'partner', select: 'name' },
        ]),
      };

      if (partner) {
        query.query = JSON.stringify({ partner });
      }
      if (
        this.config &&
        this.config.queryOptions &&
        this.config.queryOptions.sort
      ) {
        query.sort = JSON.stringify(this.config.queryOptions.sort);
      }
      this.data = await firstValueFrom(
        this.integrationsService.getIntegrations(query),
      );
      this.dataCollection = this.data;
      this.getRcxprocessLabels(this.enumData.RCXProcess);
      await this.getTemplatesOptions();
      this.utilsService.filterListData(this);
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getData() {
    await this.getFilterData();
    await this.getConnections();
    await this.getListData();
    if (history.state?.properties?.template) {
      // TODO need to check the use case of this
      this.searchValue = history?.state?.properties?.name || '';
      this.inputFieldValue = history.state?.filter?.option;
      this.onChange({
        input: history.state?.filter?.option,
        fieldName: history.state?.filter?.value,
      });
      history.replaceState({ properties: {} }, '');
    } else {
      this.utilsService.filterListData(this);
    }
  }

  async getConnections() {
    try {
      const s3Data = await firstValueFrom(
        this.connectionsService.getConnections('s3', {}),
      );
      const sftpData = await firstValueFrom(
        this.connectionsService.getConnections('sftp', {}),
      );

      this.connectionNameOptions = [...s3Data, ...sftpData].map((obj) => {
        return { id: obj._id, name: obj.name };
      });
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getTemplatesOptions() {
    try {
      const query = JSON.stringify({ status: 'Published' });

      this.templateNameOptions = (
        (await firstValueFrom(
          this.templatesService.getTemplates({ query, select: 'name' }),
        )) || []
      ).map((x) => {
        return { name: x.name, id: x._id };
      });
      this.config['Template'] = this.templateNameOptions;
    } catch (err) {}
  }

  getPartnersOptions(partners) {
    this.partnerNameOptions = partners.map((p) => {
      return { name: p.name, id: p._id };
    });
    this.config['Partner'] = this.partnerNameOptions;
  }

  getDropDownEnums(enums, enumName) {
    this.enumOptions = enums.map((e) => {
      return { name: e.label, id: e._id };
    });
    this.config[enumName] = this.enumOptions;
  }

  viewGrid() {
    this.service.setComponentView('integrationListView', false);
    this.showListView = this.service.getComponentView('integrationListView');
  }

  viewList() {
    this.service.setComponentView('integrationListView', true);
    this.showListView = this.service.getComponentView('integrationListView');
  }

  async confirmationWithData() {
    await this.integrationUtilsService.confirmationWithData.call(
      this,
      ...arguments,
    );
    await this.getListData();
  }

  async publishIntegration(row: any) {
    await this.integrationUtilsService.publishIntegrationConfirm(row, { confirmation: this.integrationConfirm.bind(this)});
  }

  async deleteIntegration(row: any) {
    this.integrationUtilsService.deleteIntegrationConfirm(row, { confirmation: this.integrationConfirm.bind(this)});
  }

  async unpublishIntegration(row: any) {
    await this.integrationUtilsService.unpublishIntegrationConfirm(row, { confirmation: this.integrationConfirm.bind(this)});
  }

  async resumeIntegration(row: any) {
    await this.integrationUtilsService.resumeIntegrationConfirm(row, { confirmation: this.integrationConfirm.bind(this)});
  }

  async pauseIntegration(row: any) {
    await this.integrationUtilsService.pauseIntegrationConfirm(row, { confirmation: this.integrationConfirm.bind(this)});
  }

  async integrationConfirm(type, row) {
    await this.integrationUtilsService.integrationConfirm(type, row);
    await this.getListData();
  }

  filterData() {
    const inputValuesCollection = [
      ...this.partnerName,
      ...this.integrationName,
    ];

    this.data = this.dataCollection;
    this.data =
      inputValuesCollection.length !== 0
        ? this.data.filter((el) => {
            if (
              inputValuesCollection.includes(el.name) &&
              this.partnerName.length === 0
            ) {
              return el;
            } else if (
              inputValuesCollection.includes(el.partner.name) &&
              this.integrationName.length === 0
            ) {
              return el;
            } else if (
              inputValuesCollection.includes(el.name) &&
              inputValuesCollection.includes(el.partner.name)
            ) {
              return el;
            }
          })
        : this.dataCollection;
    const filteredData = this.data;

    if (this.searchValue.length) {
      this.data = this.data.filter(
        (el) =>
          el.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
          (el.description &&
            el.description.toLowerCase().includes(this.searchValue)),
      );
    } else {
      this.data = filteredData;
    }
  }

  onIntegrationNameChange(inputValue: any[]) {
    this.integrationName = inputValue.map((el) => {
      return el.name;
    });
    this.filterData();
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
}
