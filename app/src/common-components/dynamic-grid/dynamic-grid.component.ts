import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  AfterContentInit,
  Component,
  ContentChild,
  Input,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { DynamicPipeService } from 'src/app/shared/services/dynamic-pipe.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
@Component({
  selector: 'app-dynamic-grid',
  templateUrl: './dynamic-grid.component.html',
  styleUrls: ['./dynamic-grid.component.scss'],
})
export class DynamicGridComponent implements AfterContentInit {
  @Input() config: any;
  @Input() data: any;
  @Input() handler: any;
  @Input() showPagination = true;
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<any>;
  sections: any;
  currentPageData: any[];

  @ContentChild('actionsColumn', { static: true })
  actionsColumnTemplate!: TemplateRef<any>;

  cardViewType: any;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private pipeService: DynamicPipeService,
    public dialog: MatDialog,
    private router: Router,
    private uiConfigService: UiConfigService,
    private utilService: UtilsService,
  ) {}

  ngAfterContentInit() {
    this.initializeData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data?.currentValue) this.initializeData();
    // this.dataSource.paginator = this.paginator;
  }

  async ngOnInit() {
    this.config.commonProperties =
      await this.uiConfigService.importCommonProperties();
  }

  initializeData() {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.config = this.config || {};
    this.sections = this.config.sections;
    this.cardViewType = this.data?.cardViewType;
    if (this.paginator) {
      this.currentPageData = this.data?.slice(0, this.paginator.pageSize);
    } else {
      this.currentPageData = this.data?.slice(
        0,
        this.config.paginationOptions.pageSize,
      );
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    if (this.paginator) {
      this.dataSource.paginator.page
        .pipe(
          startWith({}),
          switchMap(() => {
            const startIndex =
              this.paginator.pageIndex * this.paginator.pageSize;
            const endIndex = startIndex + this.paginator.pageSize;

            return of(this.data?.slice(startIndex, endIndex));
          }),
        )
        .subscribe((data) => (this.currentPageData = data));
    }
  }

  getStatusClass(status: string): string {
    return `status-button-${(status || 'published').toLowerCase().replace(/\s+/g, '')}`;
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

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  disableConditionBased(item, elementData) {
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

  onRowClick(element: any, item: any) {
    if (item.routerLink) {
      if(item.subdoc){
        this.router.navigate([`${item.routerLink}/${element[item.subdoc]['_id']}`],{state :{ source: item.source}});
      }
      else {
        this.router.navigate([`${item.routerLink}/${element._id}`], {state: { source: item.source}});
      }
    }
  }

  actionHandler(action: any, data: any) {
    if (
      action.clickHandler &&
      typeof this.handler[action.clickHandler] === 'function'
    ) {
      return this.handler[action.clickHandler](data);
    }
  }

  getRange(number: number): number[] {
    return Array.from({ length: number }, (_, i) => i);
  }

  getFieldValue(data, property, isSubField) {
    let value = property.default || '';

    if (isSubField && property.subField) {
      value = this.getValue(property.subField, data, property.default);
    } else {
      value = this.getValue(property.name, data, property.default);
    }
    if (property.pipe || (isSubField && property.subFieldPipe)) {
      value =
        this.pipeService.pipes[
          isSubField ? property.subFieldPipe : property.pipe
        ](value);
    }

    return value;
  }

  pipe(value: any, pipeName: string | undefined): any {
    if (pipeName) {
      return this.pipeService.pipes[pipeName](value);
    }

    return value;
  }

  getValue(path, data, preset = '') {
    const value = path.split('.').reduce((o, i) => (o ? o[i] : o), data);

    return value || preset || '';
  }
}
