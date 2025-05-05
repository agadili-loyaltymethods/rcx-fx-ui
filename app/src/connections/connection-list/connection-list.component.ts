import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { IntegrationUtilsService } from 'src/app/shared/services/integration-utils.service';
import { IntegrationsService } from 'src/app/shared/services/integrations.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { sharedConstants } from '../../shared';
import { ConnectionUtils } from 'src/app/shared/services/connection-utils.service';

@Component({
  selector: 'connection-template-list',
  templateUrl: './connection-list.component.html',
  styleUrls: ['./connection-list.component.scss'],
})
export class ConnectionListComponent {
  @Input() config: any;
  @Input() data: any;
  @Input() handler: any;
  @Input() requiredData: any = {};
  handlers: any = {
    edit: this.edit.bind(this),
    delete: this.delete.bind(this),
    test: this.test.bind(this),
    populateIntegrations: this.populateIntegrations.bind(this),
    resetSelection: this.resetSelection.bind(this),
    deleteIntegration: this.deleteIntegration.bind(this),
    copyIntegration: this.integrationUtilsService.copyIntegration.bind(this),
    editIntegration: this.integrationUtilsService.editIntegration.bind(this.integrationUtilsService),
    runOnceIntegration: this.integrationUtilsService.runOnceIntegration.bind(this),
    resumeIntegration: this.resumeIntegration.bind(this),
    pauseIntegration: this.pauseIntegration.bind(this),
    publishIntegration: this.publishIntegration.bind(this),
    unpublishIntegration: this.unpublishIntegration.bind(this)
  };

  secondaryData: any; //should not assign default value

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private integrationUtilsService: IntegrationUtilsService,
    public utilService: UtilsService, //this is used in HTML file, please don't remove it
    private integrationsService: IntegrationsService,
    private alertService: AlertService, // we are using this integrationUtilsService. Please don't remove it.
    private connectionUtils: ConnectionUtils,
  ) {}

  @ViewChild(MatSort) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  async ngOnChanges() {
    if (this.data) {
      if (this.data.length && this.data[0]._id) {
        this.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        this.requiredData.selectedRow = this.data[0];
      }
      await this.populateIntegrations();
    }
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

  edit(row: any) {
  this.connectionUtils.edit(row)
  }

  delete(row: any): void {
    // Perform delete action for the row
    this.handler.delete(row);
  }

  test(row: any): void {
    this.handler.test(row);
  }

  async populateIntegrations() {
    if (!this.utilService.checkPerms({ FX_Integration: ['read'] })) {
      return;
    }
    if (
      this.data &&
      this.data.length &&
      this.requiredData &&
      this.requiredData.selectedRow &&
      this.requiredData.selectedRow._id
    ) {
      const query = {
        $or: [
          { 'inputProperties.connection': this.requiredData.selectedRow._id },
          {
            'responseProperties.connection': this.requiredData.selectedRow._id,
          },
        ],
      };

      try {
        this.secondaryData = await firstValueFrom(
          this.integrationsService.getIntegrations({
            query: JSON.stringify(query),
            populate: JSON.stringify({
              path: 'template',
              select: 'name',
            }),
            sort: JSON.stringify(this.config?.integrations?.queryOptions?.sort)
          }),
        );

        return;
      } catch (err) {
        this.alertService.errorAlert(
          (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
        );
      }
    }
    this.secondaryData = [];
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
