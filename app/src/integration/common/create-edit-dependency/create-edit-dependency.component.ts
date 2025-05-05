import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-edit-dependency',
  templateUrl: './create-edit-dependency.component.html',
  styleUrls: ['./create-edit-dependency.component.scss'],
})
export class CreateEditDependencyComponent implements OnInit {
  formGroup: FormGroup = new FormGroup({
    dependencyName: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    dependencyType: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
  });

  newDependency: any = {
    name: '',
    type: '',
    list: [],
  };

  handlers: any;

  constructor(
    public dialogRef: MatDialogRef<CreateEditDependencyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.newDependency = this.data.row ? { ...this.data.row } : {};
    this.newDependency.list = this.newDependency.list || [];
    if (this.newDependency.list.length) {
      this.newDependency.list = this.data.integrations
        .filter((i) => this.newDependency.list.includes(i.id))
        .slice();
    }
    this.handlers = this.data.handlers;
  }

  onSave(): void {
    this.handlers.handleIsModifiedChange(true);
    const name = this.newDependency.name;
    const type = this.newDependency.type;
    const list = this.newDependency.list;

    const editedDependency = {
      name,
      type,
      list: list.map((l) => l.id),
    };

    this.dialogRef.close(editedDependency);
  }

  onDependencyListChange(event) {
    this.newDependency.list = event.input || [];
  }
}
