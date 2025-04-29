import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  AfterViewInit,
  Component,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { RunHistoryDialogComponent } from 'src/app/run-history/run-history-dialog/run-history-dialog.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DynamicPipeService } from 'src/app/shared/services/dynamic-pipe.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { ExecutionLogDialogComponent } from '../execution-log-dialog/execution-log-dialog.component';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
})
export class DynamicTableComponent implements AfterViewInit {
  // @Input() displayedColumns: any = [
  //   'name',
  //   'run_id',
  //   'input',
  //   'response',
  //   'status',
  //   'start',
  //   'end',
  //   'duration',
  //   'succeeded',
  //   'failed',
  //   'actions',
  // ];
  @Input() data: any;
  @Input() parentData: any;
  @Input() config: any = [];
  @Input() handlers: any;
  @Input() showPagination = true;
  @Input() requiredData: any = {};
  @Input() isView;
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<any>;
  defaultActiveSort: any;
  primaryColumns: any = [];
  uicfg: any = [];
  tableDataSource: any;
  rowActions: any;
  isHostingPartner: any;
  multiSelect: Boolean = false;

  secondHeader = ['Integration_Name_Run_Id', 'Files', 'Timeframe', 'Records'];


  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private pipeService: DynamicPipeService,
    private router: Router,
    private clipboard: Clipboard,
    private alertservice: AlertService,
    private uiConfigService: UiConfigService,
    private utilService: UtilsService,
  ) {
    this.defaultActiveSort = this.primaryColumns[0];
  }

  async ngOnInit() {
    this.config.commonProperties =
      await this.uiConfigService.importCommonProperties();
  }

  intializeData() {
    this.primaryColumns = [];
    this.uicfg = [];
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.sortingDataAccessor = (item, header) => {
      header.split('.').forEach((path) => {
        item = (item && item[path]) || null;
      });

      return item;
    };
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.rowActions = this.config.actions || [];
  }

  displayConditionBased(item, elementData) {
    let permissionCondRes = true;

    if (item.permissionCond) {
      permissionCondRes = this.utilService.checkPerms(item.permissionCond);
    }
    if (!permissionCondRes) {
      return false;
    }
    if (item.dispCondField) {
      if (typeof item.dispCondField === 'object') {
        return item.dispCondField.every((element) => {
          const value = _.get(elementData, element);

          if (typeof item.dispCondValue[element] === 'object') {
            if (item.dispCondValue[element].nin) {
              return !item.dispCondValue[element].nin.includes(value);
            }
            if (item.dispCondValue[element].in) {
              return item.dispCondValue[element].in.includes(value);
            }
          }

          return value === item.dispCondValue[element];
        });
      } else {
        const value = _.get(elementData, item.dispCondField);

        return value === item.dispCondValue;
      }
    }

    return true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue) {
      const self = this;

      this.intializeData();
      for (const cfg of this.config.data || []) {
        this.uicfg.push(cfg);
        this.primaryColumns.push(self.getColumn(cfg));
      }
    }
  }

  ngAfterViewInit() {
    if(this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
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

  edit(): void {
    // Perform edit action for the row
  }

  delete(): void {
    // Perform delete action for the row
  }

  getClassName(elem, data) {
    let style = '';

    if (elem && elem.style) {
      style += ' ' + elem.style;
    }
    if (elem && elem.applyStyleWith) {
      style +=
        ' ' +
        `${elem.applyStyleWith}-${data[elem.styleField]
          .toLowerCase()
          .split(' ')
          .join('')}`;
    }

    return style;
  }

  onRowClick(element, item) {
    if (!item.routerLink && !item.clickHandler) {
      return;
    }
    if (item.clickHandler) {
      return this.handlers[item.clickHandler](element);
    }
    if (item.subdoc) {
      element = element[item.subdoc];
    }
    if (item.stateProperty) {
      this.router.navigate([`${item.routerLink}/${element._id}`], {
        state: { [item.stateProperty]: element, source: item.source },
      });
    } else {
      this.router.navigate([`${item.routerLink}/${element._id}`], { state: {element, source: item.source}});
    }
  }

  getColumn(property) {
    return property.name;
    // return property.name;
    // if (input.includes('_')) {
    //   let firstString =
    //     input.split('_')[0].charAt(0).toUpperCase() +
    //     input.split('_')[0].slice(1);
    //   let secondString =
    //     input.split('_')[1].charAt(0).toUpperCase() +
    //     input.split('_')[1].slice(1);
    //   return firstString +' '+ secondString;
    // } else {
    //   return `${input.charAt(0).toUpperCase() + input.slice(1)}`;
    // }
  }

  actionHandler(event, action, data, index) {
    event.stopPropagation();
    const handler = action.clickHandler;

    if (
      handler &&
      this.handlers &&
      typeof this.handlers[handler] === 'function'
    ) {
      return this.handlers[handler](data, index);
    }
  }

  getValue(path, data, preset = '') {
    const value = path.split('.').reduce((o, i) => (o ? o[i] : o), data);

    return value !== undefined ? value : value || preset || '';
  }

  getFieldValue(data, property, isSubField) {
    let value = property.default || '';

    if (isSubField && property.subField) {
      value = this.getValue(property.subField, data, property.default);
    } else {
      value = this.getValue(property.name, data, property.default);
    }
    if (property.valueFormat) {
      value = property.valueFormat['' + value] || value;
    }
    if (!value) {
      value = property.default || '';
    }
    if (
      value !== property.default &&
      (property.pipe || (isSubField && property.subFieldPipe))
    ) {
      if (property.applyPipeCond) {
        if (data[property.applyPipeCond.key] === property.applyPipeCond.value) {
          value =
            this.pipeService.pipes[
              isSubField ? property.subFieldPipe : property.pipe
            ](value);
        }
      } else {
        value =
          this.pipeService.pipes[
            isSubField ? property.subFieldPipe : property.pipe
          ](value);
      }
    }
    if (property.truncateFileName) {
      value = this.returnFileName(value);
    }

    return value;
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

  returnFileName(value) {
    return `${value.substring(0, 9)}..${value.substring(value.length - 12)}`;
  }

  openDialog() {
    const dialogRef = this.dialog.open(ExecutionLogDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
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

  openRunHistoryDetails(element: any) {
    this.dialog.open(RunHistoryDialogComponent, {
      minWidth: '300px',
      data: element,
    });
  }

  copyToClipboard(event, data: any) {
    this.clipboard.copy(data);
    this.alertservice.successAlert(data + ' copied to clipboard');
    event.stopPropagation();
  }


  multipleToggleSelection() {
    this.multiSelect = !this.multiSelect;
    if(this.multiSelect) {
      this.requiredData.selectedData = [...this.data];
    } else {
      this.requiredData.selectedData = [];
    }
  }

  toggleSelection(item: any): void {
    const itemIndex = this.requiredData.selectedData.findIndex(
      (selectedItem) => selectedItem === item,
    );

    if (itemIndex === -1) {
      this.requiredData.selectedData.push(item);
    } else {
      this.requiredData.selectedData.splice(itemIndex, 1);
    }
  }

  isSelected(item: any): boolean {
    if (this.requiredData?.selectedData?.length !== this.data?.length) {
      this.multiSelect = false;
    } else {
      this.multiSelect = true;
    }
    return (this.requiredData?.selectedData || []).includes(item);
  }

  isSelectedRow(item: any): boolean {
    return (
      this.requiredData.selectedRow &&
      item &&
      this.requiredData.selectedRow._id === item._id
    );
  }

  selectRow(row) {
    if (!this.config.selectRow) {
      return;
    }
    this.requiredData.selectedRow = row;
    if (
      this.config.selectRowHandler &&
      typeof this.handlers[this.config.selectRowHandler] === 'function'
    ) {
      this.handlers[this.config.selectRowHandler]();
    }
  }

  changeOrder() {
    this.dataSource.connect().subscribe((d) => {
      if (
        d.length &&
        this.handlers.resetSelection &&
        typeof this.handlers.resetSelection === 'function'
      ) {
        this.handlers.resetSelection(d);
      }
    });
  }
}
