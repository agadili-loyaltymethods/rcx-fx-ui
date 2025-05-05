import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';

export interface Options {
  id: string;
  name: string;
}

@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableFilterComponent implements OnInit {
  showSliderBar = false;
  runHistoryData: any;
  cfgOpt: any;
  inputValue = '';
  inputFieldValue: any[] = [];
  dataFromChild: any = [];
  refresh = false;
  @Input() searchValue;
  @Input() startDate: any = null;
  @Input() endDate: any = null;
  @Input() statusFilter;
  @Input() tableData;
  @Input() config;
  @Input() handlers;
  @Input() pageName;
  @Output() startTimeChange = new EventEmitter();
  @Output() endTimeChange = new EventEmitter();
  @Output() filterChange = new EventEmitter();
  @Output() inputChange = new EventEmitter();
  @Output() statusChange = new EventEmitter();
  @Output() searchValueChange = new EventEmitter();
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  data: any;
  protected integrationNameOptions: Options[] = [];
  protected runIdOptions: Options[] = [];
  protected partnerNameOptions: Options[] = [];

  originalOrder = () => 0;

  constructor(
    private uiConfigService: UiConfigService,
    private utilsService: UtilsService
  ) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getListViewConfig('run-history')) || {};
    this.cfgOpt = this.config?.filterOptions || {};
    this.refresh = this.config?.refresh ?? false;
    this.initializeDateRange();
  }

  initializeDateRange() {
    const searchHistory = this.utilsService.getPageFilters(this.pageName);
    if (searchHistory.startDate) {
      this.range.setValue({ start: searchHistory.startDate, end: searchHistory.endDate });
    }
  }

  getRefreshData() {
    if (this.handlers && typeof this.handlers.getRefresh === 'function') {
      this.handlers.getRefresh();
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.startDate && changes.startDate.currentValue) {
      this.initializeDateRange();
    }
    this.getDropDownOptions(this.tableData);
    this.cfgOpt = this.config?.filterOptions;
    if (!this.data && this.tableData && this.tableData.length) {
      this.data = this.tableData;
      this.dataFromChild = [...this.data];
    }
    if (this.config && this.config.element && this.config.runId) {
      this.inputFieldValue = [this.config.element];
      this.config.element = '';
    }
  }

  getDropDownOptions(data) {
    if (!data) {
      return;
    }
    for (const i of data) {
      const runIdArray = this.runIdOptions.map((obj) => obj.name);
      const uniquerunIdSet = new Set(runIdArray);
      const uniquerunIdArray = Array.from(uniquerunIdSet);
      const intergrationNameArray = this.integrationNameOptions.map(
        (obj) => obj.name,
      );
      const uniqueIntegrationNameSet = new Set(intergrationNameArray);
      const uniqueIntegrationNameArray = Array.from(uniqueIntegrationNameSet);
      const partnerNameArray = this.partnerNameOptions.map((obj) => obj.name);
      const uniquePartnerNameSet = new Set(partnerNameArray);
      const uniquePartnerNameArray = Array.from(uniquePartnerNameSet);

      if (!uniquerunIdArray.includes(i.runId)) {
        const runIdObj = {
          name: i.runId,
          id: i._id,
        };

        this.runIdOptions.push(runIdObj);
      }
      if (i.integrationId) {
        if (!uniqueIntegrationNameArray.includes(i.integrationId.name)) {
          this.integrationNameOptions.push({
            name: i.integrationId.name,
            id: i.integrationId._id,
          });
        }
      }
      if (i.partner && !uniquePartnerNameArray.includes(i.partner.name)) {
        this.partnerNameOptions.push({
          name: i.partner.name,
          id: i.partner._id,
        });
      }
    }
    if (this.config) {
      this.config['Integration'] = this.integrationNameOptions;
      this.config['Run Id'] = this.runIdOptions;
      this.config['Partner'] = this.partnerNameOptions;
    }
  }

  showSlider() {
    this.showSliderBar = !this.showSliderBar;
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

  onChange(options) {
    this.filterChange.emit(options);
  }

  onStartDateChange() {
    this.startDate = this.getFormattedDate(
      moment(this.range.get('start').value).startOf('day'),
    );
    this.startTimeChange.emit(this.startDate);
  }

  onEndDateChange() {
    this.endDate = this.getFormattedDate(
      moment(this.range.get('end').value).endOf('day'),
    );
    this.endTimeChange.emit(this.endDate);
  }

  getFormattedDate(dateValue) {
    if (dateValue) {
      const formattedDate = dateValue.toISOString();

      return formattedDate;
    } else {
      return dateValue;
    }
  }

  onStatusChange(inputValue: string) {
    this.statusChange.emit(inputValue);
  }

  onInputValueChange(inputValue: string) {
    this.config.filters['searchValue'] = this.searchValue;
    this.inputValue = inputValue;
    this.inputChange.emit(this.inputValue);
  }

  resetFilters() {
    this.runIdOptions = [];
    this.integrationNameOptions = [];
    this.partnerNameOptions = [];
    this.statusFilter = 'all';
    this.inputFieldValue = [];
    this.config.filters = {};
    this.statusChange.emit('all');
    this.range.setValue({ start: null, end: null });
    this.filterChange.emit([[], '']);
    this.startTimeChange.emit(null);
    this.endTimeChange.emit(null);
    this.searchValueChange.emit({ input: '' });
    this.utilsService.resetPageFilters(this.pageName);
  }

  getSelectedValue(list = [], fieldName) {
    let filters = this.config.filters[fieldName] || [];
    if (!Array.isArray(filters)) {
      filters = [filters];
    }
    return list.filter(l => filters.includes(l.name));
  }

  onSearchValueChange(options) {
    this.searchValueChange.emit(options);
  }
}
