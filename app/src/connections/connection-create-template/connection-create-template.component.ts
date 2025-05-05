import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import { Connection } from 'src/app/models/connection';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ConnectionsService } from 'src/app/shared/services/connections.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { PartnersService } from 'src/app/shared/services/partners.service';
import { ProgramsService } from 'src/app/shared/services/programs.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { sharedConstants } from '../../shared';
import { ConnectionUtils } from 'src/app/shared/services/connection-utils.service';

@Component({
  selector: 'connection-create-template',
  templateUrl: './connection-create-template.component.html',
  styleUrls: ['./connection-create-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConnectionCreateTemplateComponent {
  formGroup: FormGroup = new FormGroup([]);

  options = ['Option 1', 'Option 2', 'Option 3'];
  selectionConnection = '';

  data = new Connection();
  isEdit: any;
  isView: any;
  partners = [];
  enumData: any = {};
  emailFormControl = new FormControl('', [Validators.required]);
  @ViewChild('imgFileInputs') inputElement: ElementRef | undefined;
  routeSub: Subscription;
  filteredPartners = [];
  testedData = {};
  selectedData = [];
  config: any;
  dbToUIFieldMappings: any;
  isModified = false;
  keyFile: File = null;
  encryptionKey: File = null;
  deletePermission: boolean;
  handlers: any = {
    onFileSelected: this.onFileSelected.bind(this),
    handleChange: this.toggle.bind(this),
  };
  connectionId: any;
  sub: Subscription;

  @ViewChild('drawer') drawer;
  errors: any = [];

  constructor(
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private uiConfigService: UiConfigService,
    private drawerService: DrawerService,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private partnersService: PartnersService,
    private programsService: ProgramsService,
    private connectionsService: ConnectionsService,
    private connectionUtils: ConnectionUtils,
  ) {}

  onFileSelected(event, key) {
    const file: File = event.target.files[0];
    if (file) {
      this[key] = file
      this.readFileContent(file, key);
    }
  }

  toggle(item) {
    if (item.field === 'encryptionEnabled') {
      this.formGroup.get('encryptionAlgorithm').setValue(null);
      this.formGroup.get('encryptPassphrase').setValue(null);
    }
    if (item.field === 'compressionEnabled') {
      this.formGroup.get('compressionAlgorithm').setValue(null);
    }
  }

  readFileContent(file: File, key: string) {
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const fileContent: string = e.target.result;

      this.formGroup.controls[key].setValue(fileContent);
    };

    reader.readAsText(file);
  }

  async ngOnInit() {
    this.sub = this.route.paramMap.subscribe((params) => {
      this.connectionId = params.get("id");
    });
    const historyData = await this.getCurrentConnection(this.connectionId);
    if (Object.keys(historyData).length > 1) {
      this.data = historyData;
      this.testedData = JSON.parse(JSON.stringify(this.data));
    }
    this.config =
      (await this.uiConfigService.getFormViewConfig('connections')) || {};
    this.dbToUIFieldMappings = this.config.dbToUIFieldMappings || {};
    this.data.partner = this.data.partner?._id || this.data.partner;
    this.routeSub = this.route.url.subscribe((url) => {
      this.isEdit = url[0]?.path === 'edit';
      this.isView = url[0]?.path === 'detail';
    });
    this.getData();
    this.deletePermission = await this.utilsService.checkPerms({FX_Connection: ['delete']})
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.sub.unsubscribe();
  }

  async getCurrentConnection(id) {
    if (!id) {
      return {};
    }
    let data = [];
    try {
      let query = JSON.stringify({ _id: id });
      data = await firstValueFrom(
        this.connectionsService.getConnections('s3', { query }),
      );
      if (!data.length) {
        data = await firstValueFrom(
          this.connectionsService.getConnections('sftp', { query }),
        );
      }
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
    return data[0] || {};
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

  edit(row: any) {
    this.connectionUtils.edit(row)    
  }

  delete(row: any): void {
    if (!this.deletePermission) {
      return;
    }
    this.dialog.open(ConfirmationDialog, {
      data: {
        data: row,
        schema: 'Delete Connection',
        content: `Are you sure that you want to delete <strong>${row.name}</strong>?`,
        confirmButton: 'Yes, Delete',
        cancelButton: 'No',
        confirmation: () => {
         this.confirmation();
        }
      },
    });
  }
  async confirmation() {
    try {
      await firstValueFrom(this.connectionsService.deleteConnections(this.data));
      this.alertService.successAlert('Connection deleted successfully');
      this.isModified = false;
      this.navigate();
    } catch (err) {
      this.alertService.errorAlert(
        err.errorMessage || 'Cannot delete connection',
      );
    }
  }

  async confirmationDialog(row) {
    this.connectionUtils.confirmationDialog(row)
  }

  navigate() {
    this.connectionUtils.navigate()
  }

  async getData() {
    const query = {
      query: JSON.stringify({
        type: {
          $in: [
            'ConnectionType',
            'AuthenticationType',
            'CompressionAlgorithmType',
            'EncryptionAlgorithmType',
            'AWSRegion',
          ],
        },
        lang: 'en',
      }),
      select: 'label,type,value',
    };

    try {
      const data = await firstValueFrom(this.partnersService.getPartners({}));

      this.partners = data.sort((a, b) => a.name.localeCompare(b.name));
      const enums = await firstValueFrom(this.programsService.getEnums(query));

      for (const x of enums) {
        if (!this.enumData[x.type]) {
          this.enumData[x.type] = [];
        }
        this.enumData[x.type].push(x);
      }
      this.enumData.partners = this.partners || [];
      this.formGroup.controls['partnerFormControl']?.valueChanges.subscribe(
        (searchTerm) => {
          this.enumData.partners = this.filterPartners(searchTerm);
        },
      );
      this.enumData.partnerFormControl =
        this.formGroup.controls['partnerFormControl'];
      this.enumData.selectedData = this.selectedData;
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  filterPartners(searchTerm: string) {
    return this.partners.filter((partner) =>
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  compareTestedData() {
    let checkArr = [];

    if (this.data.connectionType === 'S3') {
      checkArr = ['url', 'accessKeyId', 'secretAccessKey', 'region'];
    } else {
      checkArr = ['url', 'userName', 'password'];
    }

    return checkArr.every((key) => this.data[key] === this.testedData[key])
      ? this.data.tested
      : false;
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formGroup = formGroup;
  }

  async save() {
    this.isModified = false;
    try {
      this.data.tested = this.compareTestedData();
      this.data.lastTestedAt = new Date();
      let dataCopy: any = JSON.stringify(this.data);
      const formData = new FormData();
      if(this.keyFile) {
        formData.append('keyFile', this.keyFile, this.keyFile.name);
      }
      if(this.encryptionKey) {
        formData.append('encryptionKey', this.encryptionKey, this.encryptionKey.name);
      }      
      formData.append('data', dataCopy);
      await firstValueFrom(
        this.connectionsService.postConnections(formData, this.isEdit, this.data),
      );
      this.router.navigate(['connections']);
      this.alertService.successAlert('Connection successfully saved.');
    } catch (err) {
      if (err.errorMessage === 'Validation Error') {
        this.errors = this.utilsService.parseError(
          err,
          this.dbToUIFieldMappings,
        );
        if (!this.drawerService.getDrawerState()) {
          this.drawerService.setDrawerState(true);
          this.drawer.toggle();
        }

        return;
      }
      this.alertService.errorAlert(
        err.errorMessage || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async test() {
    try {
      const connections = this.utilsService.prepareConnectionsForTest(
        JSON.parse(JSON.stringify([this.data])),
      );
      const formData = new FormData();
      if (this.keyFile) {
        formData.append('keyFile', this.keyFile, this.keyFile.name);
      }
      let dataCopy: any = JSON.stringify(this.data);
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
        this.data.tested = true;
        this.testedData = JSON.parse(JSON.stringify(this.data));
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
  }
}
