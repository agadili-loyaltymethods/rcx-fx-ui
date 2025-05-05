import { Component, Input } from '@angular/core';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/shared/services/utils.service';

@Component({
  selector: 'app-status-cards',
  templateUrl: './status-cards.component.html',
  styleUrls: ['./status-cards.component.scss'],
})
export class StatusCardsComponent {
  statusData = {};
  config;
  @Input() runsCount;
  @Input() integrationsCount;
  @Input() dateRange;
  @Input() filterDuration;

  constructor(
    private uiConfigService: UiConfigService,
    private router: Router,
    private utilsService: UtilsService,
  ) {}

  async ngOnInit() {
    this.config = (await this.uiConfigService.getStatusCardCfg(
      'dashboard',
    )) || { cards: [] };
  }

  ngOnChanges() {
    this.config = this.config || { cards: [] };
    this.formatData();
  }

  formatData() {
    this.statusData = {
      failedRunsCount: this.runsCount.failed.curr,
      failedRunsDiff: this.runsCount.failed.curr - this.runsCount.failed.prev,
      succeededRunsCount: this.runsCount.succeeded.curr,
      succeededRunsDiff:
        this.runsCount.succeeded.curr - this.runsCount.succeeded.prev,
      failedIntsCount: this.integrationsCount.failed.curr,
      failedIntsDiff:
        this.integrationsCount.failed.curr - this.integrationsCount.failed.prev,
      succeededIntsCount: this.integrationsCount.succeeded.curr,
      succeededIntsDiff:
        this.integrationsCount.succeeded.curr -
        this.integrationsCount.succeeded.prev,
    };
  }

  redirectToRunHistory(card) {
    const state: any = {
      statusFilter: card.name.indexOf('failed') > -1 ? 'Failed' : 'Succeeded',
      filterDuration: this.filterDuration,
      dateRange: this.dateRange,
    };
    this.utilsService.resetPageFilters('run-history');
    this.router.navigate(['run-history'], { state });
  }
}
