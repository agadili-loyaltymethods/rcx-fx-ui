import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import { sharedConstants } from '../constants/shared-constants';
import { AlertService } from './alert.service';
import { IntegrationsService } from './integrations.service';
import { DynamicPipeService } from './dynamic-pipe.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class IntegrationUtilsService {
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private alertService: AlertService,
    private integrationsService: IntegrationsService,
    private pipeService: DynamicPipeService,
  ) {}

  async ngOnInit() {}

  async deleteIntegration(row: any): Promise<any> {
    try {
        await firstValueFrom(this.integrationsService.deleteIntegration(row));
      this.alertService.successAlert(
        `Integration deleted successfully`,
      );
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || sharedConstants.deleteIntegrationErrorMsg,
      );
    }
  }

  async unpublishIntegration(row: any): Promise<any> {
    try {
      const query = JSON.stringify({ hardDelete: row.hardDelete });
      await firstValueFrom(
        this.integrationsService.cancelIntegration(row, query),
      );
      this.alertService.successAlert(
        `The unpublish action has been triggered. Please wait for it to complete.`
      );
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || sharedConstants.unpublishIntegrationErrorMsg,
      );
    }
  }

  async confirmationWithData(row: any, name: any): Promise<any> {
    try {
      const newRow = JSON.parse(JSON.stringify(row));
      if (newRow.status === 'Published') {
        delete newRow.instanceId;
        delete newRow.triggerId;
      }
      delete newRow?._id;
      newRow.name = name || newRow.name + ' - copy';
      newRow.status = 'Revision';
      const currentDate = new Date().setMinutes(new Date().getMinutes() + 5, 0, 0);
      newRow.scheduling.effectiveDate = moment(currentDate);
      delete newRow?.createdAt;
      delete newRow?.createdBy;
      delete newRow?.updatedAt;
      delete newRow?.updatedBy;
      await firstValueFrom(
        this.integrationsService.postIntegration(newRow, false),
      );
      this.alertService.successAlert('Integration copied successfully');
    } catch (err) {
      this.alertService.errorAlert(
        err.errors[0] || sharedConstants.defaultErrorMessage,
      );
    }
  }


  deleteIntegrationConfirm(row: any, handlers: any = {}): void {
      this.dialog.open(ConfirmationDialog, {
        data: {
          data: row,
          schema: 'Delete Integrations',
          content: `Are you sure that you want to delete <strong>${
            row.name || ''
          }</strong>?`,
          confirmButton: 'Yes, Delete',
          cancelButton: 'No',
          confirmation: () => {
            handlers['confirmation']('delete', row)
          }
        },
      });
  }

  copyIntegration(row: any): void {
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        schema: 'Integration',
        getInput: true,
        inputType: 'text',
        header: 'Please enter the Integration Name',
        confirmationWithData: this.confirmationWithData.bind(this),
      },
    });
  }

  async resumeIntegration(row: any): Promise<any> {
    try {
      const data = await this.integrationsService
        .resumeIntegration(row._id)
        .toPromise();

      this.alertService.successAlert(
        data.result || 'Integration resumed successfully',
      );
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || 'Cannot resume integration',
      );
    }
  }

  async pauseIntegration(row: any): Promise<any> {
    try {
      const data = await this.integrationsService
        .pauseIntegration(row._id)
        .toPromise();

      this.alertService.successAlert(
        data.result || 'Integration paused successfully',
      );
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || 'Cannot pause integration',
      );
    }
  }

  async runOnceIntegration(row: any): Promise<any> {
    try {
      this.dialog.open(ConfirmationDialog, {
        data: {
          data: row,
          schema: 'Confirm Action',
          content: 'Are you sure you want to run integration once?',
          confirmButton: 'Yes',
          cancelButton: 'No',
          confirmation: async () => {
            try {
              await this.integrationsService
                .runOnceIntegration(row._id)
                .toPromise();
              this.alertService.successAlert(
                `Integration ${row.name} has been submitted for immediate execution.please check run history for details`,
              );
            } catch (err) {
              this.alertService.errorAlert(
                err.errorMessage || sharedConstants.runIntegrationErrorMsg,
              );
            }
          },
        },
      });
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || sharedConstants.runIntegrationErrorMsg,
      );
    }
  }

  editIntegration(row: any) {
    row.status = 'Revision';
    this.router.navigate([`integrations/edit/${row._id}`], { state: { properties: row } });
  }
  
  async publishIntegration(integration) {
    try {
      await firstValueFrom(
        this.integrationsService.publishIntegration(integration._id),
      );
      this.dialog.open(ConfirmationDialog, {
        data: {
          schema: 'Publish Status',
          content:
            'Provisioning backend resources started. Please check integration status to track progress.',
          confirmButton: 'Ok',
          disableCancelButton: true,
        },
      });
    } catch(err) {
      this.alertService.errorAlert(
        err?.errorMessage || sharedConstants.publishIntegrationErrorMsg,
      );
    }
  }

  publishIntegrationErrorDialog() {
    this.dialog.open(ConfirmationDialog, {
      data: {
        schema: 'Publish Failed',
        content: 'Please resolve the validation errors and try again.',
        confirmButton: 'Ok',
        disableCancelButton: true,
      },
    });
  }

  async publishIntegrationConfirm(integration: any, handlers: any = {}) {
    try {
      await firstValueFrom(
        this.integrationsService.postIntegration(integration, true, true),
      );
      const nextRuns = await this.integrationsService
          .getNextRuns(integration._id)
          .toPromise();
          let schedules = nextRuns?.[0]?.scheduledRuns ?? [];
          let scheduledRuns = []
          schedules.map(field => {
            scheduledRuns.push(this.pipeService.pipes.dateTimeFormat(field));
          })

        if (scheduledRuns.length > 7) {
          scheduledRuns = [
            ...scheduledRuns.slice(0, 5),
            ...['...'],
            ...scheduledRuns.slice(length - 2),
          ];
        }
        if (scheduledRuns && scheduledRuns.length) {
          this.dialog.open(ConfirmationDialog, {
            data: {
              data: integration,
              listView: true,
              arrayList: scheduledRuns,
              schema: 'Publish Integration - Pending Past Triggers',
              content: `Publishing the <strong>${integration.name}</strong> integration will cause it to trigger for past runs because the effective date of the integration is in the past. <br>Would you like to proceed?`,
              confirmButton: 'Proceed',
              cancelButton: 'Cancel',
              confirmation: () => {
                handlers['confirmation']('publish', integration);
              },
            },
          });
        } else {
          this.dialog.open(ConfirmationDialog, {
            data: {
              schema: 'Confirm Action',
              content: 'Are you sure you want to publish integration?',
              confirmButton: 'Yes',
              cancelButton: 'No',
              confirmation: () => {
                handlers['confirmation']('publish', integration);
              }
            }
          });
        }
    } catch (err) {
        const errors = err?.errors || [];
        if (errors.length) {
          this.publishIntegrationErrorDialog();
          return;
        }
    }
  }

  async resumeIntegrationConfirm(row: any, handlers: any = {}) {
    const nextRuns = await this.integrationsService
      .getNextRuns(row._id)
      .toPromise();
      let schedules = nextRuns?.[0]?.scheduledRuns ?? [];
      let scheduledRuns = []
      schedules.map(field => {
        scheduledRuns.push(this.pipeService.pipes.dateTimeFormat(field));
      })

    if (scheduledRuns.length > 7) {
      scheduledRuns = [
        ...scheduledRuns.slice(0, 5),
        ...['...'],
        ...scheduledRuns.slice(length - 2),
      ];
    }
    if (scheduledRuns && scheduledRuns.length) {
      this.dialog.open(ConfirmationDialog, {
        data: {
          listView: true,
          arrayList: scheduledRuns,
          schema: 'Resume Integration - Pending Past Triggers',
          content: ` Resuming the <strong>${row.name}</strong> integration will cause it to trigger for past runs that were missed while it was paused. <br> Would you like to proceed?`,
          confirmButton: 'Proceed',
          cancelButton: 'Cancel',
          confirmation: () => {
            // this.resumeIntegration(row);
            handlers['confirmation']('resume', row);
          },
        },
      });
    } else {
      this.dialog.open(ConfirmationDialog, {
        data: {
          data: row,
          schema: 'Confirm Action',
          content: 'Are you sure you want to resume integration?',
          confirmButton: 'Yes',
          cancelButton: 'No',
          confirmation: () => {
            // this.resumeIntegration(row);
            handlers['confirmation']('resume', row);
          },
        }
      });
    }
  }

  async pauseIntegrationConfirm(row: any, handlers: any = {}) {
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        schema: 'Confirm Action',
        content: 'Are you sure  you want to pause integration?',
        confirmButton: 'Yes',
        cancelButton: 'No',
        confirmation: async () => {
          handlers['confirmation']('pause', row);
        }
      }
    });
  }

  async unpublishIntegrationConfirm(row: any, handlers: any = {}) {
    row.hardDelete = false;
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        getInput: true,
        inputType: 'switch',
        header: 'Unpublish Integration - Preserve Run History',
        textBlock:
          'Unpublishing will deallocate all backend resources associated with the integration and move it to Revision status.<br>Would you like to keep Run History?',
        content: [
          { key: 'Discard Run History', value: true },
          { key: 'Keep Run History', value: false },
        ],
        confirmationButton: 'Submit',
        cancelButton: 'No',
        confirmationWithData: () => {
          handlers['confirmation']('unpublish', row)
        }
      },
    });
  }

  async integrationConfirm(type, row) {
    switch (type) {
      case 'publish':
        await this.publishIntegration.call(this, row);
        break;
      case 'resume':
        await this.resumeIntegration.call(this, row);
        break;
      case 'pause':
        await this.pauseIntegration.call(this, row);
        break;
      case 'unpublish':
        await this.unpublishIntegration.call(this, row);
        break;
      case 'delete':
        await this.deleteIntegration.call(this, row);
        break;
    }
  }
}
