import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/shared/services/alert.service';
import { IntegrationsService } from 'src/app/shared/services/integrations.service';
import { sharedConstants } from '../../shared';
import { IntegrationUtilsService } from 'src/app/shared/services/integration-utils.service';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent {
  dataSource: MatTableDataSource<any>;
  @Input() config: any;
  @Input() data: any;
  @Input() handler: any;
  @Input() requiredData: any;
  tableDataSource: any = [];
  handlers: any = {
    edit: this.edit.bind(this),
    copy: this.copy.bind(this),
    delete: this.delete.bind(this),
    populateIntegrations: this.populateIntegrations.bind(this),
    resetSelection: this.resetSelection.bind(this),
    copyIntegration: this.integrationUtilsService.copyIntegration.bind(this),
    deleteIntegration: this.deleteIntegration.bind(this),
    editIntegration: this.integrationUtilsService.editIntegration.bind(this.integrationUtilsService),
    resumeIntegration: this.resumeIntegration.bind(this),
    pauseIntegration: this.pauseIntegration.bind(this),
    runOnceIntegration: this.integrationUtilsService.runOnceIntegration.bind(this),
    publishIntegration: this.publishIntegration.bind(this),
    unpublishIntegration: this.unpublishIntegration.bind(this),
    export: this.export.bind(this)
  };

  secondaryData: any; //should not assign default value

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private integrationsService: IntegrationsService,
    private alertService: AlertService,
    private integrationUtilsService: IntegrationUtilsService,
  ) {}

  @ViewChild(MatSort) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  async ngOnInit() {}

  async ngOnChanges() {
    if (this.data) {
      if (this.data.length) {
        this.requiredData.selectedRow = this.data[0];
      }
      await this.populateIntegrations();
    }
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
  }

  resetSelection(data: any) {
    this.requiredData.selectedRow = (data && data[0]) || {};
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  copy(row: any) {
    this.handler.copy(row);
  }

  edit(row: any): void {
    this.handler.edit(row);
  }

  delete(row: any): void {
    this.handler.delete(row);
  }

  export(row: any): void {
    this.handler.export(row);
  }

  getClassName(statusParam: string) {
    return `status-${statusParam.toLowerCase()}`;
  }

  async populateIntegrations() {
    try {
      if (
        this.data &&
        this.data.length &&
        this.requiredData &&
        this.requiredData.selectedRow &&
        this.requiredData.selectedRow._id
      ) {
        const query = { template: this.requiredData.selectedRow._id };
        const params: any = { query: JSON.stringify(query) };

        if (
          this.config &&
          this.config.queryOptions &&
          this.config.queryOptions.sort
        ) {
          params.sort = JSON.stringify(this.config.queryOptions.sort);
        }
        this.secondaryData = await this.integrationsService
          .getIntegrations(params)
          .toPromise();

        return;
      }
      this.secondaryData = [];
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async confirmationWithData() {
    await this.integrationUtilsService.confirmationWithData.call(
      this,
      ...arguments,
    );
    await this.populateIntegrations();
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
    await this.populateIntegrations();
  }
}
