import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { CreateEditIntegrationParameterComponent } from '../create-edit-integration-parameter/create-edit-integration-parameter.component';
@Component({
  selector: 'app-integration-parameters',
  templateUrl: './integration-parameters.component.html',
  styleUrls: ['./integration-parameters.component.scss'],
})
export class IntegrationParametersComponent implements OnInit {
  @Input() data;
  @Input() handlers;
  @Input() isView;
  @Output() dataChange = new EventEmitter<any>();
  handler: any = {
    edit: this.edit.bind(this),
    delete: this.delete.bind(this),
  };

  searchedValue = '';
  dataCollection: any = [];
  config: any;
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private uiConfigService: UiConfigService,
  ) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getListViewConfig(
        'integration-parameters',
      )) || {};
    this.dataCollection = this.data;
    this.dataChange.subscribe((data) => {
      this.dataCollection = data;
    });
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

  openDialog(): void {
    const dialogRef = this.dialog.open(
      CreateEditIntegrationParameterComponent,
      {
        width: '720px',
        data: {
          row: this.data,
          handlers: this.handlers,
        },
      },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveNewparameter(result);
      }
    });
  }

  saveNewparameter(newparameter: any): void {
    const newData = [...this.data];

    newData.push(newparameter);
    this.data = newData;
    this.dataChange.emit(this.data);
  }

  edit(row: any): void {
    const dialogRef = this.dialog.open(
      CreateEditIntegrationParameterComponent,
      {
        width: '720px',
        data: { row, handlers: this.handlers },
      },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newData = this.data.map((parameter) =>
          parameter.name === row.name ? result : parameter,
        );

        this.data = newData;
        this.dataChange.emit(this.data);
      }
    });
  }

  delete(row: any, rowNum: any): void {
    const index = this.data.findIndex((parameter, ind) => {
      if (!parameter.name && !row.name) {
        return ind === rowNum;
      }

      return parameter.name === row.name;
    });

    if (index !== -1) {
      const newData = [...this.data];

      newData.splice(index, 1);
      this.data = newData;
      this.dataChange.emit(this.data);
    }
  }

  onSearchInputValueChange(event: any) {
    this.searchedValue = event.target.value;
    this.searchedValue = this.searchedValue.toLowerCase();
    if (this.searchedValue.length) {
      this.data = this.dataCollection.filter(
        (el) => el.name?.toLowerCase().includes(this.searchedValue),
      );
    } else {
      this.data = this.dataCollection;
    }
  }
}
