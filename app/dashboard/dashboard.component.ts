import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UiConfigService } from '../shared/services/ui-config.service';
import { UtilsService } from '../shared/services/utils.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { IntegrationsService } from '../shared/services/integrations.service';
import { AlertService } from '../shared/services/alert.service';
import { sharedConstants } from '../shared';
import { Service } from '../shared/services/service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  viewStyle =  this.service.getComponentView('dashboardTableView') ? 'table' : 'chart' ||  'table';
  filterDuration = this.utilsService.getFilters();
  failedData: any = [];
  succeededData: any = [];
  totalData: any = [];
  totalCurrData: any = [];
  runsCount = {
    failed: {
      prev: 0,
      curr: 0,
    },
    succeeded: {
      prev: 0,
      curr: 0,
    },
  };

  integrationsCount = {
    failed: {
      prev: 0,
      curr: 0,
    },
    succeeded: {
      prev: 0,
      curr: 0,
    },
  };

  config: any;
  timeMap = {
    day: 86400000 * 2,
    week: 86400000 * 14,
    month: 86400000 * 60,
  };

  dateRange: any;
  handlers: any = {
    gotoRunHistory: this.gotoRunHistory.bind(this),
  };

  constructor(
    private service: Service,
    private uiConfigService: UiConfigService,
    private utilsService: UtilsService,
    private router: Router,
    private integrationsService: IntegrationsService,
    private alertService: AlertService,
  ) {}

  async ngOnInit() {
    this.filterDuration = this.utilsService.getFilters();
    this.config = await this.uiConfigService.getListViewConfig('dashboard');
    await this.getData();
  }
  isCurrPeriodData(currentDate, data) {
    return moment(data.startTime).isAfter(
      moment(currentDate)
        .subtract(this.timeMap[this.filterDuration] / 2, 'milliseconds')
        .startOf('day'),
    );
  }

  gotoRunHistory(element: any) {
    const state = {
      element: { name: element?.runId, id: element?._id },
      filterDuration: this.filterDuration,
      statusFilter: element.status,
    };
    this.utilsService.resetPageFilters('run-history');
    this.router.navigate(['/run-history'], { state });
  }

  async getData() {
    this.totalCurrData = [];
    this.runsCount.failed.prev = 0;
    this.runsCount.failed.curr = 0;
    this.runsCount.succeeded.prev = 0;
    this.runsCount.succeeded.curr = 0;
    this.failedData = [];
    this.succeededData = [];
    const currentDate = new Date();

    this.dateRange = {
      startDate: currentDate.getTime() - this.timeMap[this.filterDuration],
      actualStartDate:
        currentDate.getTime() - this.timeMap[this.filterDuration] / 2,
      endDate: currentDate.getTime(),
    };
    if (this.filterDuration !== 'day') {
      this.dateRange.startDate = moment(new Date(this.dateRange.startDate))
        .startOf('day')
        .toDate();
      this.dateRange.actualStartDate = moment(
        new Date(this.dateRange.actualStartDate),
      )
        .startOf('day')
        .toDate();
      this.dateRange.endDate = moment(new Date(this.dateRange.endDate))
        .endOf('day')
        .toDate();
    }
    const params = {
      query: JSON.stringify({
        startTime: {
          $gte: this.dateRange.startDate,
          $lte: this.dateRange.endDate,
        },
      }),
      populate: JSON.stringify([{ path: 'integrationId', select: 'name' }]),
      sort: JSON.stringify({ _id: -1 }),
    };
    const failedIntegrations: any = {
      prev: {},
      curr: {},
    };
    const succeededIntegrations: any = {
      prev: {},
      curr: {},
    };
    let processingCount = 0;

    try {
      this.totalData = await firstValueFrom(
        this.integrationsService.getRunHistories(params),
      );
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
    this.totalData.forEach((data) => {
      const integrationId = data.integrationId?._id || data.integrationId;

      if (data.startTime && data.endTime) {
        data.duration = this.utilsService.calculateDurationInSeconds(
          data.startTime,
          data.endTime,
        );
      }
      const isCurrentData = this.isCurrPeriodData(currentDate, data);

      if (isCurrentData) {
        this.totalCurrData.push(data);
      }
      if (data.status === 'Failed') {
        if (!isCurrentData) {
          this.runsCount.failed.prev += 1;
          if (!failedIntegrations.prev[integrationId]) {
            failedIntegrations.prev[integrationId] = true;
          }
        } else {
          this.runsCount.failed.curr += 1;
          if (this.runsCount.failed.curr <= 5) {
            this.failedData.push(data);
          }
          if (!failedIntegrations.curr[integrationId]) {
            failedIntegrations.curr[integrationId] = true;
          }
        }
      } else {
        if (!isCurrentData && data.status === 'Succeeded') {
          this.runsCount.succeeded.prev += 1;
          if (!succeededIntegrations.prev[integrationId]) {
            succeededIntegrations.prev[integrationId] = true;
          }
        } else {
          if (data.status === 'Processing') {
            processingCount += 1;
          }
          if (data.status === 'Succeeded') {
            this.runsCount.succeeded.curr += 1;
            if (!succeededIntegrations.curr[integrationId]) {
              succeededIntegrations.curr[integrationId] = true;
            }
          }
          if (this.runsCount.succeeded.curr + processingCount <= 5) {
            this.succeededData.push(data);
          }
        }
      }
    });
    this.totalCurrData = [...this.totalCurrData];
    const counts: any = {
      failed: {},
      succeeded: {},
    };

    counts.failed.prev = Object.keys(failedIntegrations.prev).length || 0;
    counts.failed.curr = Object.keys(failedIntegrations.curr).length || 0;
    counts.succeeded.prev = Object.keys(succeededIntegrations.prev).length || 0;
    counts.succeeded.curr = Object.keys(succeededIntegrations.curr).length || 0;
    this.integrationsCount = counts;
  }

  viewAll(status: string) {
    const state: any = {
      statusFilter: status,
      dateRange: this.dateRange,
      filterDuration: this.filterDuration,
    };
    this.utilsService.resetPageFilters('run-history');
    this.router.navigate(['run-history'], { state });
  }

  viewData(value: boolean) {
    this.service.setComponentView('dashboardTableView', value);
  }
  
  daysFilter(value: string) {
    this.utilsService.setFilters(value);
  }
}
