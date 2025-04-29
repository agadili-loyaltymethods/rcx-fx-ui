import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
@Component({
  selector: 'app-integration-list',
  templateUrl: './integration-list.component.html',
  styleUrls: ['./integration-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IntegrationListComponent {
  @Input() config: any;
  @Input() data: any;
  @Input() handler: any;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
  ) {
    // this.tableDataSource = new MatTableDataSource(this.dataSource);
  }

  async ngOnInit() {
    // await this.getData();
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

}
