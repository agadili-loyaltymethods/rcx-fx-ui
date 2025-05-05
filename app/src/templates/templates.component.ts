import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { ConfirmationDialog } from '../common-components/delete-button/confirmation-dialog.component';
import { sharedConstants } from '../shared';
import { AlertService } from '../shared/services/alert.service';
import { AuthService } from '../shared/services/auth.service';
import { IntegrationsService } from '../shared/services/integrations.service';
import { PartnersService } from '../shared/services/partners.service';
import { ProgramsService } from '../shared/services/programs.service';
import { Service } from '../shared/services/service';
import { TemplatesService } from '../shared/services/templates.service';
import { UtilsService } from '../shared/services/utils.service';
import { saveAs } from 'file-saver';
import { DynamicPipeService } from 'src/app/shared/services/dynamic-pipe.service';

export interface Options {
  id: string;
  name: string;
}
@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TemplatesComponent {
  config: any;
  cfgOpt: any;
  data: any; //should to assign default value
  dataCollection: any[] = [];
  showListView = true;
  inputFieldValue: any[];
  searchValue = '';
  refresh = false;
  enumOptions: any;
  enumData: any = {};
  pageName = 'templates';
  requiredData: any = { selectedData: [] };

  getDataHandler = {
    copy: this.copy.bind(this),
    delete: this.delete.bind(this),
    edit: this.edit.bind(this),
    export: this.export.bind(this)
  };

  protected partnersOptions: Options[] = [];
  protected lastUpdatedByOptions: Options[] = [];
  protected rcxProcessOptions: Options[] = [];
  enums: any[] = [];

  constructor(
    private uiConfigService: UiConfigService,
    private router: Router,
    private service: Service,
    public utilsService: UtilsService, //this is used in HTML file, please don't remove it
    private alertService: AlertService,
    public dialog: MatDialog,
    private templatesService: TemplatesService,
    private integrationsService: IntegrationsService,
    private programsService: ProgramsService,
    private partnersService: PartnersService,
    private authService: AuthService,
    private pipeService: DynamicPipeService
  ) {}

  originalOrder = () => 0;

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getListViewConfig('templates')) || {};
    this.config.integrations = 
      JSON.parse(JSON.stringify((await this.uiConfigService.getListViewConfig('integrations')) || {}));
    this.config.integrations.data = (this.config.integrations.data || []).filter(i => {
      if (i.modifySource) {
        i.source = 'templates'
      }
      if (!i?.displayPages) {
        return true;
      } else {
        return i.displayPages.includes("templates");
      }
    });
    this.showListView = this.service.getComponentView('templateListView');
    this.refresh = this.config?.refresh ?? false;
    this.cfgOpt = this.config.filterOptions;
    this.config.filters = {};
    this.config.Status = [{ name: 'Published', id: 'Published' }, { name: 'Revision', id: 'Revision' }];
    await this.getData();
  }

  async getData() {
    await this.getFilterData();
    await this.getListData();
  }

  async getFilterData() {
    const types = ['RCXProcess', 'DataType', 'FileFormatType', 'QuoteStringType', 'MathFuncs', 'DateFormatType', 'TransformType'];
    let enumType = 'EnumType';
    const query = {
      query: JSON.stringify({
        $or: [
          { type: { $in: types } },
          { type: enumType, value: { $in: types } }
        ],
        lang: 'en'
      }),
    };

    try {
      this.enums = await firstValueFrom(this.programsService.getEnums(query));      
      for (const x of this.enums) {
        if (!this.enumData[x.type]) {
          this.enumData[x.type] = [];
        }
        this.enumData[x.type].push(x);
      }
      this.getDropDownEnums(this.enumData.RCXProcess, 'RCX Process');
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

  async getRefreshData() {
    await this.getListData();
  }

  getRcxprocesslabel(rcxProcessData) {
    this.data?.forEach((item) => {
      const matchingEnum = rcxProcessData?.find(
        (enumItem) => enumItem.value === item.rcxProcess,
      );

      if (matchingEnum) {
        item.rcxProcess = matchingEnum.label;
      }
    });
  }

  async getListData() {
    try {
      this.data = await this.callHandler();
      this.dataCollection = this.data;
      this.getRcxprocesslabel(this.enumData.RCXProcess);
      this.getUpdatedByOptions(this.data);
      this.utilsService.filterListData(this);
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  getDropDownEnums(enums, enumName) {
    this.enumOptions = enums?.map((e) => {
      return { name: e.label, id: e._id };
    });
    this.config[enumName] = this.enumOptions;
  }

  getPartnersOptions(partners) {
    this.partnersOptions = partners.map((p) => {
      return { name: p.name, id: p._id };
    });
    this.config['Partner'] = this.partnersOptions;
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

  viewGrid() {
    this.service.setComponentView('templateListView', false);
    this.showListView = this.service.getComponentView('templateListView');
  }

  viewList() {
    this.service.setComponentView('templateListView', true);
    this.showListView = this.service.getComponentView('templateListView');
  }

  createTemplate() {
    this.router.navigate(['templates/create']);
  }

  copy(row: any) {
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        schema: 'Template',
        getInput: true,
        inputType: 'text',
        header: 'Please enter the Template Name',
        confirmationWithData: this.confirmationWithData.bind(this),
      },
    });
  }

  async confirmationWithData(row: any, name) {
    try {
      const matchedEnum = this.enums.find(
        (enumItem) => enumItem.label === row.rcxProcess,
      );

      if (matchedEnum) {
        row.rcxProcess = matchedEnum.value;
      }
      const newRow = JSON.parse(JSON.stringify(row));

      delete newRow?._id;
      newRow.name = name || newRow.name + ' - copy';
      newRow.status = 'Revision';
      delete newRow?.createdAt;
      delete newRow?.createdBy;
      delete newRow?.updatedAt;
      delete newRow?.updatedBy;
      await firstValueFrom(
        this.templatesService.postIntegrationTemplate(newRow, false),
      );
      this.alertService.successAlert(
        'Template copied successfully.',
      );
      // this.router.navigate(['templates']);
      this.getListData();
    } catch (err) {
      this.alertService.errorAlert(
        err.errors?.[0] || sharedConstants.defaultErrorMessage,
      );
    }
  }

  editTemplate(row: any) {
    row.status = 'Revision';
    this.router.navigate([`templates/edit/${row._id}`]);
  }

  async edit(row: any) {
    // Perform edit action for the row
    const query = JSON.stringify({ template: row._id });
    const depIntegrations = await firstValueFrom(
      this.integrationsService.getIntegrations({ query }),
    );
    const validStatuses = ['Paused', 'Publish Pending', 'Published'];
    const hasValidIntegrationStatus = depIntegrations.some(item => validStatuses.includes(item.status));

    if (row.status === 'Published' && depIntegrations.length) {
      if (hasValidIntegrationStatus) {
        this.dialog.open(ConfirmationDialog, {
          data: {
            schema: 'Warning',
            content: `Unable to edit template <strong>${row.name}</strong>, as it is used in one or more integrations.`,
            confirmButton: 'Close',
            disableCancelButton: true,
          },
        });
      } else {
        this.dialog.open(ConfirmationDialog, {
          data: {
            schema: 'Warning',
            content: `The template <strong>${row.name}</strong> is currently utilized in one or more integrations, meaning that any modifications to the template will impact the execution of these integrations. Would you like to proceed?`,
            confirmButton: 'Yes',
            cancelButton: 'Cancel',
            confirmation: () => this.editTemplate(row),
          },
        });
      }
    } else {
      this.editTemplate(row);
    }
  }

  delete(row: any): void {
    // Perform delete action for the row
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        schema: 'Delete Template',
        content: `Are you sure that you want to delete <strong>${row.name}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        confirmation: this.confirmationDialog.bind(this),
      },
    });
  }

  updateEnumData() {
    let enums = {};
    this.enums.forEach((e) => {
      if(!enums[e.type]) {
          enums[e.type] = [] 
      }
      enums[e.type]?.push(e);
    });
    return enums;
  }

  async export(data: any = {}) {    
    let dataCopy = {
      data: JSON.parse(JSON.stringify(data)),
      enums: this.updateEnumData(),
      templateName: data.name || 'templates',
      isExport: true
    }
    if (!Array.isArray(dataCopy.data)) {
      dataCopy.data = [dataCopy.data];
    }
    if(this.enumData['RCXProcess'].length) {
    dataCopy.data.forEach((template) => {
        let enumVal = this.enumData['RCXProcess'].find((item) => {
          return item.label === template.rcxProcess;
        })
        if(enumVal?.value) {
          template.rcxProcess = enumVal.value;
        }
      })
    }
    let dialogData = null;
    try {
      await firstValueFrom(
        this.templatesService.postIntegrationTemplate(
          this.utilsService.filterTemplateData(JSON.parse(JSON.stringify(dataCopy))),
          false,
          true,
        )
      );
    } catch {
      dialogData = {
        schema: 'Export Failed',
        content: 'Please resolve the validation errors and try again.',
        confirmButton: 'Ok',
        disableCancelButton: true,
      }
    }
    this.dialog.open(ConfirmationDialog, {
      data: dialogData || {
        data: dataCopy,
        schema: 'Export Template',
        content: `Are you sure that you want to export <strong>${dataCopy.templateName}</strong>?`,
        confirmButton: 'Yes',
        cancelButton: 'No',
        confirmation: this.exportData.bind(this),
      }
    });
  }

  exportData(data) {
    let fileName = data.templateName;
    fileName += '.json';
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    saveAs(blob, fileName);
  }
  


  importTemplate() {
    this.dialog.open(ConfirmationDialog, {
      data: {
        confirmationButton: 'Import',
        schema: 'Validation',
        getInput: true,
        header: 'Include Json File',
        placeHolder: 'Include Json File',
        inputType: 'file',
        dialogType: 'testFile',
        slideToggle: true,
        slideToggleContent: 'Do you want to override existing template?',
        confirmationWithData: this.import.bind(this)
      },
    });
  }

  async templateImportStatus() {
    try {
      let res = await firstValueFrom(this.templatesService.importStatus());
      let data = [];
      let cssProperty = '';
      let fields: any = [{ field: 'Name', value: res?.name || '-' }];
      let status = res?.status || '-';
      if (status === 'Running') {
        cssProperty = 'color: #d98f0f; border: 1px solid #d98f0f; border-radius: 5px; padding-left: 4px; width: 58px';
      } else if (status === 'Error') {
        cssProperty = 'color: #ad2807; border: 1px solid #ad2807; border-radius: 5px; padding-left: 4px; width: 35px';
      } else if (status === 'Completed') {
        cssProperty = 'color: #058007; border: 1px solid #058007; border-radius: 5px; padding-left: 4px; width: 78px';
      }
      fields.push({ field: 'Status', value: status, css: cssProperty });
      data.push(fields);
      data.push([{ field: 'Submit Time', value: this.pipeService.pipes['dateTimeFormat'](res?.submitTime) || '-' },
      { field: 'Completion Time', value: this.pipeService.pipes['dateTimeFormat'](res?.completionTime) || '-' }]);
      if (res?.result) {
        data.push([{ field: 'Result', value: res.result, css: 'color: #058007' }])
      }
      if (res?.error) {
        data.push([{ field: 'Error', value: res.error, css: 'color: #ad2807' }])
      }
      this.dialog.open(ConfirmationDialog, {
        data: {
          formView: true,
          schema: 'Template Import Details',
          confirmButton: 'Ok',
          disableCancelButton: true,
          data: data
        },
      });
    } catch(err) {
      this.alertService.errorAlert(err.errorMessage || sharedConstants.defaultErrorMessage);
    }
  }

  //@ts-ignore
  async import(row, file, isToggleActive) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    try {
      let programs = await firstValueFrom(
        this.programsService.getProgramDetails(),
      );
      formData.append('programId', programs?.[0]?._id);
      formData.append('overrideExistingTemplate', isToggleActive);
      let res = await firstValueFrom(this.templatesService.importTemplates(formData));
      this.dialog.open(ConfirmationDialog, {
        data: {
          schema: 'Job Info',
          confirmButton: 'Ok',
          disableCancelButton: true,
          content: res?.message
        },
      });
    } catch (err) {
      this.dialog.open(ConfirmationDialog, {
        data: {
          type: 'errorDialog',
          schema: 'Job Info',
          confirmButton: 'Ok',
          disableCancelButton: true,
          content: [{ value: { statusCode: err?.httpStatusCode, errorCode: err?.errorCode, connection: err?.errorMessage } }]
        },
      });
    }
  }

  async confirmationDialog(row) {
    try {
      await firstValueFrom(this.templatesService.deleteTemplates(row));
      this.alertService.successAlert('Template deleted successfully');
      this.getListData();
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || sharedConstants.deleteTemplateErrorMsg,
      );
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
    const userDetail = await this.authService.getUser();
    const partner = userDetail.partner || '';
    const query: any = {
      populate: JSON.stringify([
        { path: 'partner' },
        { path: 'updatedBy', select: 'login' },
      ]),
    };

    if (
      this.config &&
      this.config.queryOptions &&
      this.config.queryOptions.sort
    ) {
      query.sort = JSON.stringify(this.config.queryOptions.sort);
    }
    if (partner) {
      query.query = JSON.stringify({ partner });
    }

    return await firstValueFrom(this.templatesService.getTemplates(query));
  }
}
