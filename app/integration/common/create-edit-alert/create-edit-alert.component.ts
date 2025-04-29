import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-create-edit-alert',
  templateUrl: './create-edit-alert.component.html',
  styleUrls: ['./create-edit-alert.component.scss'],
})
export class CreateEditAlertComponent implements OnInit {
  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    type: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+(\.[a-z]{2,4})(,[a-z0-9._%+-]+@[a-z0-9.-]+(\.[a-z]{2,4}))*$'),
      Validators.maxLength(500),
    ]),
  });

  handlers: any;

  constructor(
    public dialogRef: MatDialogRef<CreateEditAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.formGroup.setValue(
      !Array.isArray(this.data.row)
        ? { ...this.data.row }
        : {
            name: '',
            type: '',
            email: '',
          },
    );
    this.handlers = this.data.handlers;
  }

  onSave(): void {
    this.handlers.handleIsModifiedChange(true);
    this.dialogRef.close(this.formGroup.value);
  }
}
