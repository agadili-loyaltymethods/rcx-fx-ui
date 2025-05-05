import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PartnersService } from 'src/app/shared/services/partners.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';

@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.scss'],
})
export class PartnerListComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  @Input() config: any;
  childConfig: any;
  @Input() data: any;
  @Input() handler: any;
  requiredData: any = {};
  handlers: any = {
    edit: this.edit.bind(this),
    delete: this.delete.bind(this),
    editUser: this.editUser.bind(this),
    deleteUser: this.deleteUser.bind(this),
    getUsers: this.getUsers.bind(this),
    resetSelection: this.resetSelection.bind(this),
  };

  childData: any; //should not assign default value
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private uiConfigService: UiConfigService,
    private router: Router,
    private partnersService: PartnersService,
    public utilsService: UtilsService, //this is used in HTML file, please don't remove it
  ) {}

  async ngOnInit() {
    this.childConfig =
      (await this.uiConfigService.getListViewConfig('users')) || {};
  }

  async getUsers() {
    if (!this.utilsService.checkPerms({ User: ['read'] })) {
      return;
    }
    if (Object.keys(this.requiredData.selectedRow).length) {
      const query = {
        query: JSON.stringify({
          partner:
            this.requiredData.selectedRow && this.requiredData.selectedRow._id,
          active: true,
        }),
        populate: JSON.stringify([
          { path: 'partner', select: 'name' },
          { path: 'updatedBy', select: 'login' },
        ]),
      };

      this.childData = await firstValueFrom(
        this.partnersService.getUsers(query),
      );
    } else {
      this.childData = [];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue) {
      this.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      this.requiredData.selectedRow = (this.data && this.data[0]) || {};
      this.getUsers();
    }
  }

  resetSelection(data: any) {
    this.requiredData.selectedRow = (data && data[0]) || {};
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  edit(row: any): void {
    this.handler.edit(row);
  }

  delete(row: any): void {
    this.handler.delete(row);
  }

  editUser(row: any): void {
    this.handler.editUser(row);
  }

  deleteUser(row: any): void {
    this.handler.deleteUser(row);
  }

  createUser() {
    this.router.navigate(['users/create'], {
      state: { partner: this.requiredData.selectedRow },
    });
  }
}
