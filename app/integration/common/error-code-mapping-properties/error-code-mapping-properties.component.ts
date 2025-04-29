import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { CreateEditErrorCodeMappingComponent } from './../create-edit-error-code-mapping/create-edit-error-code-mapping.component';
@Component({
  selector: 'app-error-code-mapping-properties',
  templateUrl: './error-code-mapping-properties.component.html',
  styleUrls: ['./error-code-mapping-properties.component.scss'],
})
export class ErrorCodeMappingPropertiesComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  @Input() data;
  @Input() handlers;
  @Input() isView;
  @Output() dataChange = new EventEmitter<any>();

  defaultActiveSort: any;
  config: any;
  handler: any = {
    edit: this.edit.bind(this),
    delete: this.delete.bind(this),
  };

  errorCodes: any;
  searchedValue: any = '';
  dataCollection: any = [];
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private uiConfigService: UiConfigService,
  ) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getListViewConfig('error-code-mapping')) ||
      {};
    this.errorCodes = this.handlers.getEnumsByType('RCXErrorCode');
    this.mapDescription();
  }

  mapDescription() {
    this.data.forEach((data) => {
      const errCode = this.errorCodes.find(
        (x) => x.value.toString() === data.rcxErrorCode,
      );

      data.errorCodeDes = errCode?.desc || 'Description';
    });
    this.dataCollection = [...this.data];
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(CreateEditErrorCodeMappingComponent, {
      width: '720px',
      data: {
        row: this.data,
        handlers: this.handlers,
        errorCodes: this.errorCodes,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveNewAlert(result);
      }
    });
  }

  saveNewAlert(newErrorCode: any): void {
    const newData = [...this.data, newErrorCode];

    this.data = newData;
    this.dataChange.emit(this.data);
  }

  edit(row: any): void {
    const dialogRef = this.dialog.open(CreateEditErrorCodeMappingComponent, {
      width: '720px',
      data: {
        row,
        handlers: this.handlers,
        errorCodes: this.errorCodes,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newData = this.data.map((errorCode) =>
          errorCode.rcxErrorCode === row.rcxErrorCode ? result : errorCode,
        );

        this.data = newData;
        this.dataChange.emit(this.data);
      }
    });
  }

  delete(row: any): void {
    const index = this.data.findIndex(
      (errorCode) => errorCode.rcxErrorCode === row.rcxErrorCode,
    );

    if (index !== -1) {
      const newData = [
        ...this.data.slice(0, index),
        ...this.data.slice(index + 1),
      ];

      this.data = newData;
      this.dataChange.emit(this.data);
    }
  }

  getClassName(statusParam: string) {
    return `status-${statusParam.toLowerCase()}`;
  }

  getString(input: string) {
    return `${
      input.charAt(0).toUpperCase() + input.slice(1).replace('_', ' ')
    }`;
  }

  transform(value: any) {
    return Array.from(value);
  }

  normalField(item: string) {
    return this.actionField(item)
      ? false
      : this.statusField(item)
        ? false
        : true;
  }

  actionField(item: string) {
    return item === 'actions' ? true : false;
  }

  statusField(item: string) {
    return item === 'status' ? true : false;
  }

  formatLabel(totalMinutes: number): string {
    if (totalMinutes) {
      if (totalMinutes > 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${hours} hr ${minutes} min`;
      } else {
        const fullDuration =
          totalMinutes === 60 ? `${totalMinutes} hr` : `${totalMinutes} min`;

        // this.duration = fullDuration;
        return fullDuration;
      }
    } else {
      return '';
    }
  }

  onSearchInputValueChange(event: any) {
    this.data = this.dataCollection;
    this.searchedValue = event.target.value;
    this.searchedValue = this.searchedValue.toLowerCase();
    if (this.searchedValue.length) {
      this.data = this.data.filter(
        (el) =>
          el.rcxErrorCode.toString().includes(this.searchedValue) ||
          el.errorCodeDes.toLowerCase().includes(this.searchedValue),
      );
    }
    this.data = [...this.data];
  }
}
