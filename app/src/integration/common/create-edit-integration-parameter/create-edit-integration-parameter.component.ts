import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-create-edit-integration-parameter',
  templateUrl: './create-edit-integration-parameter.component.html',
  styleUrls: ['./create-edit-integration-parameter.component.scss'],
})
export class CreateEditIntegrationParameterComponent implements OnInit {
  integrationParams: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    type: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    value: new FormControl('', [Validators.required, Validators.maxLength(50)]),
  });

  handlers: any;

  constructor(
    public dialogRef: MatDialogRef<CreateEditIntegrationParameterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.integrationParams.setValue(
      !Array.isArray(this.data.row)
        ? { ...this.data.row }
        : {
            name: '',
            type: '',
            value: '',
          },
    );
    this.handlers = this.data.handlers;
  }

  onSave(): void {
    this.handlers.handleIsModifiedChange(true);
    this.dialogRef.close(this.integrationParams.value);
  }

  onParameterTypeChange() {
    this.integrationParams.get('value').setValue('');
  }
}
