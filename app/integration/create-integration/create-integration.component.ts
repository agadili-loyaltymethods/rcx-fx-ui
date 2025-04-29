import { Location } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { Integration } from 'src/app/models/integration';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ConnectionsService } from 'src/app/shared/services/connections.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { DynamicPipeService } from 'src/app/shared/services/dynamic-pipe.service';
import { IntegrationsService } from 'src/app/shared/services/integrations.service';
import { PartnersService } from 'src/app/shared/services/partners.service';
import { ProgramsService } from 'src/app/shared/services/programs.service';
import { TemplatesService } from 'src/app/shared/services/templates.service';
import { ConfirmationDialog } from '../../common-components/delete-button/confirmation-dialog.component';
import { sharedConstants } from '../../shared';
import { IntegrationUtilsService } from '../../shared/services/integration-utils.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UtilsService } from 'src/app/shared/services/utils.service';

@Component({
  selector: 'app-create-integration',
  templateUrl: './create-integration.component.html',
  styleUrls: ['./create-integration.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateIntegrationComponent {
  formGroup: FormGroup = new FormGroup([]);
  options = ['Option 1', 'Option 2', 'Option 3'];
  durationInSeconds = 4;
  showProperties = 'integration_properties';
  public menuCallback: Function;
  properties = new Integration();
  propertiesData: any = {};
  data: any;
  headerData: any = {
    headerName: 'Integration Properties',
  };

  propertiesMap = {
    integration_properties: 'integrationProperties',
    alerts_properties: 'alerts',
    scheduling_properties: 'scheduling',
    response_properties: 'responseProperties',
    dependencies_properties: 'dependencies',
    input_properties: 'inputProperties',
    error_code_mapping_properties: 'errorCodeMapping',
    integration_parameters: 'parameters',
  };

  comparisionExclusionFields = ['template', 'partner'];

  allEnums: any = [];
  handlers = {
    getAllPartners: this.getAllPartners.bind(this),
    getEnumsByType: this.getEnumsByType.bind(this),
    getTemplatesByParnter: this.getTemplatesByParnter.bind(this),
    getConnectionsByParnter: this.getConnectionsByParnter.bind(this),
    previewSchedule: this.previewSchedule.bind(this),
    handleIsModifiedChange: this.handleIsModifiedChange.bind(this),
  };

  @ViewChild('drawer') drawer;
  partners: any = [];
  connections: any = [];
  templates: any = [];
  allTemplates: any = [];
  routeSub: Subscription;
  sub: Subscription;
  integrationId: any;
  isEdit: boolean;
  isView: boolean;
  isPublished: boolean;
  integrations: any = [];
  errors: any = [];
  isModified = false;
  enableButton: boolean;
  deletePermission: boolean;
  publishPerm: boolean;

  constructor(
    private _snackBar: MatSnackBar,
    private alertService: AlertService,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private pipeService: DynamicPipeService,
    private drawerService: DrawerService,
    private location: Location,
    private integrationsService: IntegrationsService,
    private integrationUtilsService: IntegrationUtilsService,
    private partnersService: PartnersService,
    private templatesService: TemplatesService,
    private connectionsService: ConnectionsService,
    private programsService: ProgramsService,
    private auth: AuthService,
    private utilsService: UtilsService,
  ) {}

  async ngOnInit() {
    this.deletePermission = await this.utilsService.checkPerms({FX_Integration: ['delete']})
    this.menuCallback = this.onMenuClick.bind(this);
    this.sub = this.route.paramMap.subscribe(async params => {
      this.integrationId = params.get("id");
    });
    this.publishPerm = this.utilsService.checkPerms({ FX_PublishIntegration: ['create'] });
    this.routeSub = this.route.url.subscribe((url) => {
      this.isEdit = url[0]?.path === 'edit';
      this.isView = url[0]?.path === 'detail';
    });
    await this.getCurrentIntegration();
    if (this.propertiesData && Object.keys(this.propertiesData).length > 1) {
      this.properties = JSON.parse(JSON.stringify(this.propertiesData));
      this.isPublished = this.properties.status === 'Published';
      this.enableButton = ['Revision', 'Publish Failed'].includes(this.properties.status);
    }
    let sinfo = await this.auth.getServerInfo();
    if (sinfo?.['MAX_CONTROL_RATE']) {
      this.properties.scheduling.controlRate = this.properties.scheduling.controlRate || sinfo['MAX_CONTROL_RATE'];
    }
    this.drawerService.setDrawerState(false);
    try {
      await this.getEnums();
      await this.getPartners();
      await this.getTemplates();
      await this.getConnections();
      await this.getIntegrations();
    } catch (err) {}
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.sub.unsubscribe();
  }

  async confirmationDialog(row: any): Promise<any> {
    try {
      await firstValueFrom(this.integrationsService.deleteIntegration(row));
      this.alertService.successAlert(
        `Integration ${
          row.hardDelete || row.status === 'Revision' ? 'deleted' : 'updated'
        } successfully`,
      );
      this.navigate();
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || 'cannot delete integration',
      );
    }
  }

  listScheduledRuns(options) {
    let { effectiveDate, repeatInterval, frequency, size, lastTriggerTS } =
      options;
    const intervalMilliseconds = {
      Years: 1000 * 60 * 60 * 24 * 365,
      Months: 1000 * 60 * 60 * 24 * 30,
      Weeks: 1000 * 60 * 60 * 24 * 7,
      Days: 1000 * 60 * 60 * 24,
      Hours: 1000 * 60 * 60,
      Minutes: 1000 * 60,
    };
    const interval = intervalMilliseconds[frequency] * repeatInterval;
    let nextRun = new Date(effectiveDate);
    const runs = [];
    let counter = 0;

    if (lastTriggerTS) {
      lastTriggerTS = new Date(lastTriggerTS);
    }
    while (!size || size > counter) {
      if (!lastTriggerTS || nextRun.getTime() > lastTriggerTS.getTime()) {
        runs.push(this.getFormattedDate(nextRun)); // Add the current run time
        counter++;
      }
      nextRun = new Date(nextRun.getTime() + interval); // Calculate the next run time
    }

    return runs;
  }

  getRuns(integrations, size) {
    integrations = integrations.filter((integration) => {
      const { effectiveDate, repeating } = integration.scheduling;

      // Exclude the Integration, If Integration schedule has no effective date
      if (!effectiveDate) {
        return false;
      }
      if (!repeating && integration.lastTriggerTS) {
        return false;
      }

      // Exclude the integration if the effective date in the integration schedule is a feature date
      return new Date(effectiveDate).getTime();
    });

    return integrations
      .map((integration) => {
        const { effectiveDate, repeatInterval, frequency, repeating } =
          integration.scheduling;
        const runObj = {
          _id: integration._id,
          name: integration.name,
          scheduledRuns: [],
          instanceId: integration.instanceId,
        };

        if (!repeating) {
          runObj.scheduledRuns = [effectiveDate];

          return runObj;
        }
        const options = {
          effectiveDate,
          repeatInterval,
          frequency,
          size,
          lastTriggerTS: integration.lastTriggerTS,
        };
        const runs = this.listScheduledRuns(options);

        runObj.scheduledRuns = runs;

        return runObj;
      })
      .filter((integration) => integration.scheduledRuns.length);
  }

  async previewSchedule() {
    const runnableIntegrations = await this.getRuns([this.properties], 10);

    if (
      runnableIntegrations &&
      runnableIntegrations[0] &&
      runnableIntegrations[0].scheduledRuns.length
    ) {
      let scheduledRuns = runnableIntegrations[0].scheduledRuns;

      if (scheduledRuns.length > 7) {
        scheduledRuns = [...scheduledRuns, ...['...']];
      }
      this.dialog.open(ConfirmationDialog, {
        data: {
          listView: true,
          arrayList: scheduledRuns,
          schema: 'Preview Schedule',
          content:
            'The below are the possible future schedules for this integration.',
          confirmButton: 'Ok',
          disableCancelButton: true,
        },
      });
    }
  }

  async getCurrentIntegration() {
    const integrationId = this.integrationId;

    if (!integrationId) {
      return;
    }
    const query = JSON.stringify({
      _id: integrationId,
    });
    const populate = JSON.stringify({ path: 'updatedBy', select: 'login' });

    try {
      this.propertiesData = ((await firstValueFrom(
        this.integrationsService.getIntegrations({ query, populate }),
      )) || [{}])[0];
      if(this.isEdit) {          
        this.propertiesData.status = 'Revision';
      }
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  edit(): void {
    this.integrationUtilsService.editIntegration(this.properties);
  }

  deleteIntegration(): void {
    if (!this.deletePermission) {
      return;
    }
    this.integrationUtilsService.deleteIntegrationConfirm(this.properties, { confirmation: this.integrationConfirm.bind(this)});
  }

  async integrationConfirm(type, row) {
    await this.integrationUtilsService.integrationConfirm(type, row);
    this.isModified = false;
    this.navigate();
  }

  updateMainDataAlerts(updatedAlerts: any): void {
    this.properties.alerts = updatedAlerts;
  }

  updateMainDataDependencies(updatedDependencies: any): void {
    this.properties.dependencies = updatedDependencies;
  }

  updateMainDataECM(updatedECMs: any): void {
    this.properties.errorCodeMapping = updatedECMs;
  }

  updateMainParameters(updatedParameters: any): void {
    this.properties.parameters = updatedParameters;
  }

  getClassName() {
    return `status status-${this.properties.status
      ?.toLowerCase()
      .split(' ')
      .join('')}`;
  }

  getFormattedDate(dateTime) {
    if (dateTime) {
      return this.pipeService.pipes.dateTimeFormat(dateTime);
    }
  }

  updateFormGroup(formGroup) {
    this.formGroup = formGroup;
  }

  closeErrorPanel() {
    if (this.drawerService.getDrawerState()) {
      this.drawerService.setDrawerState(false);
      this.drawer.toggle();
    }
  }

  async save(publish = false) {
    this.closeErrorPanel();
    this.properties.status = publish ? 'Published' : 'Revision';
    try {
      const integrationProperties = await firstValueFrom(
        this.integrationsService.postIntegration(this.properties, this.isEdit)
      );
      let userDetails = await this.auth.getUser()
      integrationProperties['updatedBy'] = { login: userDetails.login };
      this.alertService.successAlert(
        `Integration successfully ${publish ? 'published' : 'saved'}`,
      );
      this.isModified = false;
      this.propertiesData = JSON.parse(JSON.stringify(this.properties))
      this.router.navigate([`integrations/edit/${integrationProperties._id}`], {
        state: {
          properties: JSON.parse(JSON.stringify(integrationProperties)),
          disableDeactivateGuard: true,
          source: 'integrations',
        },
      });
    } catch (err) {
      this.errors = err?.errors || [];
      if (!this.drawerService.getDrawerState()) {
        this.drawerService.setDrawerState(true);
        this.drawer.toggle();
      }
    }
  }

  onMenuClick(value: any) {
    this.showProperties = value;
    this.data = this.properties[this.propertiesMap[value]];
    this.headerData = {
      headerName: 'Integration Properties',
      lastUpdateBy: this.data?.updatedBy,
    };
  }

  openSnackBar(msg) {
    this._snackBar.open(msg, 'X', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: this.durationInSeconds * 1000,
    });
  }

  async getPartners() {
    try {
      const data = await firstValueFrom(
        this.partnersService.getPartners({ select: 'name,isHostingPartner' }),
      );

      this.partners = data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getTemplates() {
    try {
      const query = {
        query: JSON.stringify({ status: 'Published' }),
        select: 'name,partner,template',
      };

      if ((this.isEdit || this.isView) && this.properties.template) {
        query.query = JSON.stringify({
          $or: [{ status: 'Published' }, { _id: this.properties.template }],
        });
      }
      this.allTemplates = await firstValueFrom(
        this.templatesService.getTemplates(query),
      );
      this.templates = this.getTemplatesByParnter();
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getConnections() {
    const connectionNames = this.allEnums
      .filter((e) => e.type === 'ConnectionType')
      .map((e) => e.value);
    let connections = [];

    for (const connectionName of connectionNames) {
      try {
        const query = JSON.stringify({ tested: true });

        connections = await firstValueFrom(
          this.connectionsService.getConnections(connectionName.toLowerCase(), {
            query,
            select: 'name,partner,connectionType',
          }),
        );
        this.connections = [...this.connections, ...connections];
      } catch (err) {
        this.alertService.errorAlert(
          (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
        );
      }
    }
  }

  async getEnums() {
    const query = {
      query: JSON.stringify({
        type: {
          $in: [
            'PartnerType',
            'AlertType',
            'ConnectionType',
            'DependencyType',
            'RCXProcess',
            'FrequencyType',
            'RCXErrorCode',
            'DataType',
          ],
        },
        lang: 'en',
      }),
      select: 'label,type,value,desc',
    };

    try {
      this.allEnums = await this.programsService.getEnums(query).toPromise();
    } catch (err) {}
  }

  getAllPartners() {
    return this.partners || [];
  }

  getEnumsByType(type) {
    return this.allEnums
      .filter((e) => e.type === type)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  getTemplatesByParnter() {
    const partner = this.properties.partner?._id || this.properties.partner;

    this.templates = this.allTemplates.filter((t) => t.partner === partner);

    return this.templates;
  }

  getConnectionsByParnter() {
    const partner = this.properties.partner;
    const hoistedPartners = this.partners
      .filter((p) => p.isHostingPartner)
      .map((p) => p._id);

    return this.connections.filter(
      (c) => c.partner === partner || hoistedPartners.includes(c.partner),
    );
  }

  onDrawerClosed() {
    this.drawerService.setDrawerState(false);
  }

  async validate() {
    this.closeErrorPanel();
    try {
      await firstValueFrom(
        this.integrationsService.postIntegration(
          this.properties,
          this.isEdit,
          true,
        ),
      );
      this.alertService.successAlert('Integration validation successful.');
    } catch (err) {
      this.errors = err?.errors || [];
      if (this.errors.length) {
        if (!this.drawerService.getDrawerState()) {
          this.drawerService.setDrawerState(true);
          this.drawer.toggle();
        }
      }
    }
  }

  async getIntegrations() {
    try {
      const query = { status: 'Published' };

      if (this.properties['_id']) {
        query['_id'] = { $ne: this.properties['_id'] };
      }
      const data = await firstValueFrom(
        this.integrationsService.getIntegrations({
          query: JSON.stringify(query),
          select: 'name',
        }),
      );

      this.integrations = data;
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
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

  markAsTouched() {
    Object.keys(this.formGroup?.controls || []).forEach((controlName) => {
      this.formGroup.get(controlName).markAsTouched();
    });
  }

  async publish() {
    this.closeErrorPanel();
    try {
      await firstValueFrom(
        this.integrationsService.postIntegration(this.properties, true, true),
      );
      const nextRuns = await this.integrationsService
        .getNextRuns(this.properties._id)
        .toPromise();
      const schedules = nextRuns?.[0]?.scheduledRuns ?? [];
      let scheduledRuns = [];

      schedules.map((field) => {
        scheduledRuns.push(this.getFormattedDate(field));
      });
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
            data: this.properties,
            listView: true,
            arrayList: scheduledRuns,
            schema: 'Publish Integration - Pending Past Triggers',
            content: `Publishing the <strong>${this.properties.name}</strong> integration will cause it to trigger for past runs because the effective date of the integration is in the past. <br>Would you like to proceed?`,
            confirmButton: 'Proceed',
            cancelButton: 'Cancel',
            confirmation: async () => {
              try {
                await this.publishIntegration(this.properties);
              } catch (err) {
                const errors = err?.errors || [];

                if (errors.length) {
                  this.openDrawerState(err);

                  return;
                }
              }
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
            confirmation: async () => {
              try {
                await this.publishIntegration(this.properties);
              } catch (err) {
                const errors = err?.errors || [];

                if (errors.length) {
                  this.openDrawerState(err);

                  return;
                }
              }
            },
          },
        });
      }
    } catch (err) {
      const errors = err?.errors || [];

      if (errors.length) {
        this.openDrawerState(err);

        return;
      }
    }
  }

  openDrawerState(err) {
    this.errors = err?.errors || [];
    if (!this.drawerService.getDrawerState()) {
      this.drawerService.setDrawerState(true);
      this.drawer.toggle();
    }
  }

  async publishIntegration(integration) {
    await firstValueFrom(
      this.integrationsService.publishIntegration(integration._id),
    );
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        schema: 'Publish Status',
        content:
          'Provisioning backend resources started. Please check integration status to track progress.',
        confirmButton: 'Ok',
        disableCancelButton: true,
      },
    });

    dialogRef.afterClosed().subscribe(async () => {
      this.router.navigate(['integrations'], {
        state: { disableDeactivateGuard: true },
      });
    });
  }

  navigate() {
    if (history.state?.source !== 'integrations') {
      this.location.back();
    } else {
      this.router.navigate(['integrations/list']);
    }
  }
}
