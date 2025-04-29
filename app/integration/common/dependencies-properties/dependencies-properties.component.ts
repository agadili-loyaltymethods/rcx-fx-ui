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
import { CreateEditDependencyComponent } from './../create-edit-dependency/create-edit-dependency.component';

@Component({
  selector: 'app-dependencies-properties',
  templateUrl: './dependencies-properties.component.html',
  styleUrls: ['./dependencies-properties.component.scss'],
})
export class DependenciesPropertiesComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  @Input() data;
  @Input() handlers;
  @Input() integrations;
  @Input() isView;
  @Output() dataChange = new EventEmitter<any>();
  config: any;
  handler: any = {
    edit: this.edit.bind(this),
    delete: this.delete.bind(this),
  };

  listData = [];
  dataCollection: any = [];
  searchedValue: any = '';
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private uiConfigService: UiConfigService,
  ) {}

  async ngOnInit() {
    this.integrations = this.integrations.map((i) => {
      return { name: i.name, id: i._id };
    });
    this.config =
      (await this.uiConfigService.getListViewConfig('dependencies')) || {};
    this.setInitialData();
    this.dataChange.subscribe((data) => {
      this.dataCollection = data;
    });
  }

  setInitialData() {
    const temp = [];

    for (const d of this.data) {
      const list = this.integrations
        .filter((i) => d.list.includes(i.id))
        .map((i) => i.name);

      temp.push({ ...d, list });
    }
    this.listData = temp;
    this.dataCollection = [...this.listData];
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

  openDialog(row, cb) {
    const dialogRef = this.dialog.open(CreateEditDependencyComponent, {
      width: '720px',
      data: {
        row,
        handlers: this.handlers,
        integrations: this.integrations,
      },
    });

    dialogRef.afterClosed().subscribe(cb);
  }

  create() {
    this.openDialog(null, (result) => {
      if (result) {
        const newData = [...this.data, result];

        this.updateData(newData);
      }
    });
  }

  updateData(newData) {
    this.data = newData;
    this.dataChange.emit(this.data);
    this.setInitialData();
  }

  edit(row: any): void {
    row = { ...row };
    const found = this.data.find(
      (d) =>
        d.name === row.name &&
        d.type === row.type &&
        d.list.length === row.list.length,
    );

    if (found && found.list) {
      row.list = [...found.list];
    }
    this.openDialog(row, (result) => {
      if (result) {
        const newData = this.data.map((dependency) =>
          dependency.name === row.name ? result : dependency,
        );

        this.updateData(newData);
      }
    });
  }

  delete(row: any, rowNum: any): void {
    const index = this.data.findIndex((dependency, ind) => {
      if (!dependency.name && !row.name) {
        return ind === rowNum;
      }

      return dependency.name === row.name;
    });

    if (index > -1) {
      const newData = [
        ...this.data.slice(0, index),
        ...this.data.slice(index + 1),
      ];

      this.data = newData;
      this.dataChange.emit(this.data);
      this.setInitialData();
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
    this.searchedValue = event.target.value;
    this.searchedValue = this.searchedValue.toLowerCase();
    if (this.searchedValue.length) {
      this.data = this.dataCollection.filter(
        (el) => el.name?.toLowerCase().includes(this.searchedValue),
      );
    } else {
      this.data = this.dataCollection;
    }
    this.listData = [...this.data];
  }
}
