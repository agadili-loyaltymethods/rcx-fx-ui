import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import { AlertService } from './alert.service';
import { firstValueFrom } from 'rxjs';
import { IntegrationsService } from './integrations.service';
import { ConnectionsService } from './connections.service';
import { sharedConstants } from '../constants/shared-constants';
@Injectable({
  providedIn: 'root',
})
export class ConnectionUtils {
    constructor(
        private router: Router,
        private dialog: MatDialog,
        private alertService: AlertService,
        private integrationsService: IntegrationsService,
        private connectionsService: ConnectionsService,
        private location: Location
      ) {}

  async edit(row: any) {
    // Perform edit action for the row
    try {
      const query = JSON.stringify({
        $or: [
          {
            'inputProperties.connection': row._id,
          },
          {
            'responseProperties.connection': row._id,
          },
        ],
      });

      const depIntegrations = await firstValueFrom(
        this.integrationsService.getIntegrations({ query }),
      );

      const validStatuses = ['Published', 'Publish Pending', 'Paused'];
    const hasValidIntegrationStatus = depIntegrations.some(item => validStatuses.includes(item.status));

      if (depIntegrations.length) {
        if (hasValidIntegrationStatus) {
          this.dialog.open(ConfirmationDialog, {
            data: {
              schema: 'Warning',
              content: `Unable to edit connection <strong>${row.name}</strong>, as it is used in one or more integrations.`,
              confirmButton: 'Close',
              disableCancelButton: true,
            },
          });
        } else {
          this.dialog.open(ConfirmationDialog, {
            data: {
              schema: 'Warning',
              content: `The connection <strong>${row.name}</strong> is currently utilized in one or more integrations, meaning that any modifications to the connection will impact the execution of these integrations. Would you like to proceed?`,
              confirmButton: 'Yes',
              cancelButton: 'Cancel',
            confirmation: () => this.router.navigate([`connections/edit/${row._id}`], { state: row })

            },
          });
        }
      } else {
        this.router.navigate([`connections/edit/${row._id}`], { state: row });
      }
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }


  delete(row: any): void {
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

  navigate() {
    if (history.state?.source !== 'connections') {
      this.location.back();
    } else {
      this.router.navigate(['connection/list']);
    }
  }

  async confirmationDialog(row) {
    try {
      await firstValueFrom(this.connectionsService.deleteConnections(row));
      this.alertService.successAlert('Connection deleted successfully');
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || 'Cannot delete connection',
      );
    }
  }

}