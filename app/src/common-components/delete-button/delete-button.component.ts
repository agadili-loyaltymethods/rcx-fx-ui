import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-button',
  templateUrl: './delete-button.component.html',
  styleUrls: ['./delete-button.component.scss'],
})
export class DeleteButtonComponent {
  @Input() disableButton = false;
  constructor(public dialog: MatDialog) {}
}

// @Component({
//   selector: 'confirmation-dialog',
//   templateUrl: 'confirmation-dialog.component.html',
//   styleUrls: ['./confirmation-dialog.component.scss'],
//   standalone: true,
//   imports: [MatDialogModule, MatButtonModule, MatIconModule],
// })
// export class DialogElementsExampleDialog {}
