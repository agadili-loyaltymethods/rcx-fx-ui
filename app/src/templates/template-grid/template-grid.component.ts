import { Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { DynamicPipeService } from 'src/app/shared/services/dynamic-pipe.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-template-grid',
  templateUrl: './template-grid.component.html',
  styleUrls: ['./template-grid.component.scss'],
})
export class TemplateGridComponent {
  dataSource: any = [];
  config: any;
  @Input() data;
  @Input() handler: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private pipeService: DynamicPipeService,
    private uiConfigService: UiConfigService,
  ) {}

  async ngOnInit() {
    this.config =
      (await this.uiConfigService.getGridViewConfig('templates')) || {};
  }

  ngOnChanges() {
    if(this.data?.length) {
      this.data.paginator = this.paginator;
    }
  }

  ngAfterViewInit() {
    if (this.data) {
      this.data.paginator = this.paginator;
    }
  }

  getValue(value) {
    return this.pipeService.pipes['dateTimeFormat'](value);
  }

  copy(row: any) {
    this.handler.copy(row);
  }

  edit(row: any): void {
    this.handler.edit(row);
  }

  delete(row: any): void {
    this.handler.delete(row);
  }

  public openPopup(): void {
    //this.dialog.open(popupDialogComponent);
  }
}
