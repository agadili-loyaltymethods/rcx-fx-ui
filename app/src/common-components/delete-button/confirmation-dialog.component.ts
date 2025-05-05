import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<any>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
      dialogRef.disableClose = true;
  }

  inputData: any;
  file: any;
  fileSelected: Boolean = false;
  isToggleActive: Boolean = false;
  dialogTypes = ['testFile'];
  confirmationButton: any;

  ngOnInit() {
    this.inputData = this.data?.data?.name;
    this.inputData = (this.inputData && this.inputData + ' - copy') || '';
    this.confirmationButton = this.data?.confirmationButton || 'Copy';
  }

  confirmation() {
    if (
      this.data.confirmation &&
      typeof this.data.confirmation === 'function'
    ) {
      this.data.confirmation(this.data.data);
    }
  }

  confirmationWithData() {
    this.data.confirmationWithData(this.data.data, this.inputData, this.isToggleActive);
  }

  openDialog() {
    // this.dialog.open(DialogElementsExampleDialog);
  }

  onFileSelected(event, fileNameInput) {
    this.inputData = event.target.files[0];
    fileNameInput.value = this.inputData.name;
    this.fileSelected = true;
  }

  getButtonClass() {
    const types = this.dialogTypes;

    if (!this.inputData && types.includes(this.data.dialogType)) {
      return 'btn disable-btn';
    }

    return 'btn delete-btn';
  }
}
