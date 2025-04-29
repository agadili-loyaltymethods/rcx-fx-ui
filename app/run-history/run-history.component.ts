import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { RunHistoryDialogComponent } from 'src/app/run-history/run-history-dialog/run-history-dialog.component';
import { ExecutionLogDialogComponent } from '../common-components/execution-log-dialog/execution-log-dialog.component';
import { TableFilterComponent } from '../common-components/table-filter/table-filter.component';
import { sharedConstants } from '../shared';
import { AlertService } from '../shared/services/alert.service';
import { IntegrationsService } from '../shared/services/integrations.service';
import { ProgramsService } from '../shared/services/programs.service';
import { UiConfigService } from '../shared/services/ui-config.service';
import { UtilsService } from '../shared/services/utils.service';

@Component({
  selector: 'app-run-history',
  templateUrl: './run-history.component.html',
  styleUrls: ['./run-history.component.scss'],
})
export class RunHistoryComponent implements AfterViewInit {
  @Input() displayedColumns: any = [
    'name',
    'run_id',
    'input',
    'response',
    'status',
    'start',
    'end',
    'duration',
    'succeeded',
    'failed',
    'actions',
  ];

  @Input() tableDataSource: any;
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(TableFilterComponent) tableFilterComponent: TableFilterComponent;
  dataSource: MatTableDataSource<any>;
  defaultActiveSort: any;
  config: any;
  data: any; //should not assign default value
  inputValue = '';
  dataCollection: any = [];
  startDate: any = null;
  endDate: any = null;
  element: any = null;
  enums: any;
  status: string = history.state.statusFilter || 'all';
  handlers = {
    log: this.openInfo.bind(this),
    info: this.openRunHistoryDetails.bind(this),
    getRefresh: this.getRunHistories.bind(this),
  };

  secondHeader = ['Integration_Name_Run_Id', 'Files', 'Timeframe', 'Records'];
  searchValue = '';
  pageName = 'run-history';

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private uiConfigService: UiConfigService,
    private utilsService: UtilsService,
    private integrationsService: IntegrationsService,
    private alertService: AlertService,
    private programsService: ProgramsService,
  ) {
    this.dataSource = new MatTableDataSource();
    // this.defaultActiveSort = this.displayedColumns[0];
  }

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getListViewConfig('run-history')) || {};
          this.config.filters = {};
    await this.getData();
    history.replaceState({}, '');
  }

  async getData() {
    await this.getFilterData();
        await this.getRunHistories();
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.tableDataSource || []);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    // this.displayedColumns = this.tableHeader || this.displayedColumns;
    this.defaultActiveSort = this.displayedColumns[0];
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

  edit(row: any): void {
    // Perform edit action for the row
    console.log('Edit:', row);
  }

  delete(row: any): void {
    // Perform delete action for the row
    console.log('Delete:', row);
  }

  getClassName(statusParam: string) {
    return `status-${statusParam.toLowerCase()}`;
  }

  getString(input: string) {
    if (input.includes('_')) {
      const firstString =
        input.split('_')[0].charAt(0).toUpperCase() +
        input.split('_')[0].slice(1);
      const secondString =
        input.split('_')[1].charAt(0).toUpperCase() +
        input.split('_')[1].slice(1);

      return firstString + ' ' + secondString;
    } else {
      return `${input.charAt(0).toUpperCase() + input.slice(1)}`;
    }
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

  openInfo(element: any) {
    this.dialog.open(ExecutionLogDialogComponent, {
      data: element,
    });
  }

  formatMetricNumber(number) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });

    return formatter.format(number);
  }

  async getFilterData() {
    const enumQuery = {
      query: JSON.stringify({
        type: 'RCXProcess',
        lang: 'en',
      }),
      select: 'label,value',
    };

    try {
      this.enums = await firstValueFrom(
        this.programsService.getEnums(enumQuery),
      );
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
  }

  async getRunHistories() {
    const params: any = {
      populate: JSON.stringify([
        { path: 'integrationId', select: 'name' },
        { path: 'partner', select: 'name' },
      ]),
    };

    if (this.config.queryOptions) {
      const query = this.config.queryOptions || {};

      if (query.sort) {
        params.sort = JSON.stringify(query.sort);
      }
    }
    try {
      this.dataCollection =
        (await firstValueFrom(
          this.integrationsService.getRunHistories(params),
        )) || [];
      this.data = this.dataCollection;
      this.startDate = this.startDate ||
        history.state?.dateRange?.actualStartDate &&
        new Date(history.state.dateRange.actualStartDate).toISOString();
      if (history?.state?.dateRange?.actualStartDate) {
        this.onChange({ input: this.startDate, fieldName: 'startDate' });
      }
      this.endDate = this.endDate ||
        history.state?.dateRange?.endDate &&
        new Date(history.state.dateRange.endDate).toISOString();
      if (history?.state?.dateRange?.endDate) {
        this.onChange({ input: this.endDate, fieldName: 'endDate' });
      }
      this.status = this.status || history.state.statusFilter || '';
      if (history?.state?.statusFilter) {
        this.onChange({ input: this.status, fieldName: 'status' }, false);
      }
      if (this.status !== 'all') {
        this.config.filters = { ...this.config.filters, status: this.status };
      }
      if (this.startDate && this.endDate) {
        this.config = {
          ...this.config,
          startDate: moment(this.startDate).startOf('day'),
          endDate: moment(this.endDate).endOf('day'),
        };
      }
      this.element = history.state?.element;
      if (this.element && this.element.name) {
        this.config.filters = {
          ...this.config.filters,
          runId: this.element.name,
        };
        this.config = {
          ...this.config,
          runId: this.element.name,
          element: this.element,
        };
        this.onChange({ input: this.element.name, fieldName: 'runId' }, false);
      }
      const intParams = {
        populate: JSON.stringify([{ path: 'template', select: 'rcxProcess' }]),
      };
      const integrations =
        (await firstValueFrom(
          this.integrationsService.getIntegrations(intParams),
        )) || [];
      const rcxProcessMap = {};

      integrations.forEach((int) => {
        rcxProcessMap[int._id] = int.template?.rcxProcess;
      });
      this.utilsService.filterListData(this);
      this.dataCollection.forEach((data) => {
        data.rcxProcess = rcxProcessMap[data.integrationId?._id];
        if (data.startTime && data.endTime) {
          data.duration = this.utilsService.calculateDurationInSeconds(
            data.startTime,
            data.endTime,
          );
        }
      });
      this.dataCollection?.forEach((item) => {
        const matchingEnum = this.enums.find(
          (enumItem) => enumItem.value === item.rcxProcess,
        );

        if (matchingEnum) {
          item.rcxProcessLabel = matchingEnum.label;
        }
      });
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
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

  filterChange(options) {
    this.onChange(options);
  }

  onStartDateChange(inputValue: any) {
    this.startDate = inputValue;
    this.config.startDate = this.startDate;
  }

  onStatusChange(inputValue: any) {
    this.status = inputValue;
    this.onChange({ input: this.status, fieldName: 'status' });
  }

  onEndDateChange(inputValue: any) {
    this.endDate = inputValue;
    this.config.endDate = this.endDate;
    this.onChange({ input: this.startDate, fieldName: 'startDate' });
    this.onChange({ input: this.endDate, fieldName: 'endDate' });
  }

  onInputChange(inputValue: any) {
    this.onChange({ input: inputValue });
  }

  onSearchValueChange(options) {
    this.searchValue = options?.input || '';
    this.onChange(options);
  }

  onChange(options, updateData = true) {
    this.utilsService.onChange(this, options, updateData);
  }
}
