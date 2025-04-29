import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-edit-error-code-mapping',
  templateUrl: './create-edit-error-code-mapping.component.html',
  styleUrls: ['./create-edit-error-code-mapping.component.scss'],
})
export class CreateEditErrorCodeMappingComponent {
  formGroup = new FormGroup({
    rcxErrorCode: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    partnerErrorCode: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
  });

  newRcxErrorCode: any = {
    rcxErrorCode: '',
    errorCodeDes: '',
    partnerErrorCode: '',
  };

  description: any = 'Please select the rcxerror code';
  handlers: any;
  errorCodes: any;
  constructor(
    public dialogRef: MatDialogRef<CreateEditErrorCodeMappingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.handlers = this.data.handlers;
    this.errorCodes = this.data.errorCodes;
    this.newRcxErrorCode = this.data.row ? { ...this.data.row } : {};
    if (this.newRcxErrorCode.rcxErrorCode) {
      this.onErrorCodeChange();
    }
  }

  onSave(): void {
    this.handlers.handleIsModifiedChange(true);
    const rcxErrorCode = this.newRcxErrorCode.rcxErrorCode;
    // let des = this.newRcxErrorCode.errorCodeDes;
    const des = this.description;
    const partnerErrorCode = this.newRcxErrorCode.partnerErrorCode;

    const editedRcxErrorCode = {
      rcxErrorCode: rcxErrorCode,
      errorCodeDes: des,
      partnerErrorCode: partnerErrorCode,
    };

    this.dialogRef.close(editedRcxErrorCode);
  }

  onErrorCodeChange() {
    const errCode = this.errorCodes.find(
      (x) =>
        x.value.toString() === this.newRcxErrorCode.rcxErrorCode.toString(),
    );

    this.description = errCode?.desc || 'Des';
    this.newRcxErrorCode.rcxErrorCode = errCode.value;
  }
}
