import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-failed-integrations',
  templateUrl: './failed-integrations.component.html',
  styleUrls: ['./failed-integrations.component.scss'],
})
export class FailedIntegrationsComponent {
  displayedColumns: string[] = [
    'run_id',
    'integration_name',
    'status',
    'start',
    'end',
    'duration',
  ];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  constructor(
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
  ) {
    this.dataSource = new MatTableDataSource([
      {
        run_id: '1234123',
        integration_name: 'Integration 012',
        status: 'Failed',
        start: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
        end: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
        duration: '1 Min',
      },
      {
        run_id: '34342',
        integration_name: 'Delta Integration',
        status: 'Failed',
        start: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
        end: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
        duration: '20 Min',
      },
      {
        run_id: '35343',
        integration_name: 'Walmart + Integration',
        status: 'Failed',
        start: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
        end: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
        duration: '1h 30min',
      },
      {
        run_id: '343',
        integration_name: 'Integration 1234',
        status: 'Failed',
        start: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
        end: { date: 'dd/mm/yyyy', hours: 'hh:mm:ss' },
        duration: '1h 30min',
      },
    ]);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
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
    this.router.navigate(['partners/create']);
  }

  delete(): void {
    // Perform delete action for the row
  }

  getClassName(statusParam: string) {
    return `status-${statusParam.toLowerCase()}`;
  }

  showDetail() {
    this.router.navigate(['partners/detail']);
  }

  getHeaderName(input: string) {
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
}
