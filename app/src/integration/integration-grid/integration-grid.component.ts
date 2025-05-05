import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-integration-grid',
  templateUrl: './integration-grid.component.html',
  styleUrls: ['./integration-grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IntegrationGridComponent {
  dataSource: any = [];
  config: any;
  @Input() data: any;
  @Input() handler: any;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private uiConfigService: UiConfigService,
  ) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getGridViewConfig('integrations')) || {};
  }

  getClassName(statusParam: string) {
    return `status-${statusParam.toLowerCase()}`;
  }
}
