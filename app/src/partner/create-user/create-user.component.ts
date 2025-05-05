import {
  Component,
  OnChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { PartnersService } from 'src/app/shared/services/partners.service';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { sharedConstants } from '../../shared';

export interface ICountryAndCode {
  code: string;
  name: string;
}
@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateUserComponent implements OnChanges {
  @ViewChild('drawer') drawer;
  data: any;
  routeSub: Subscription;
  isEdit = false;
  isView = false;
  permissionsForRole: any;
  currentRole: any;
  formGroup: FormGroup = new FormGroup([]);

  requiredData: any = {};
  partner: any;
  config: any;
  dbToUIFieldMappings: any;
  errors: any = [];
  permissionListViewConfig: any;
  permissionConfigData: any = [];
  sub: Subscription;
  userId = '';

  constructor(
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private uiConfigService: UiConfigService,
    private utilsService: UtilsService,
    private drawerService: DrawerService,
    private partnersService: PartnersService,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    this.sub = this.route.paramMap.subscribe(async params => {
      this.userId = params.get("id");
    });
    await this.getCurrentUser();
    this.data.partner = history.state.partner || {};
    this.partner = JSON.parse(JSON.stringify(this.data?.partner || {}));
    this.config = (await this.uiConfigService.getFormViewConfig('users')) || {};
    this.dbToUIFieldMappings = this.config.dbToUIFieldMappings;
    this.drawerService.setDrawerState(false);
    const fullConfig = await this.uiConfigService.importConfig();

    this.permissionListViewConfig = fullConfig.users.permissionListView || {};
    this.routeSub = this.route.url.subscribe((url) => {
      this.isEdit = url[0]?.path === 'edit';
      this.isView = url[0]?.path === 'detail';
    });
    let allRoles = [];

    try {
      allRoles = await this.getRoles();
    } catch (err) {}
    this.requiredData.selectRoles = allRoles;
  }

  handlers = {
    onRoleChange: this.onRoleChange.bind(this),
    checkCurrentRole: this.checkCurrentRole.bind(this),
  };
  async getCurrentUser() {
    const userId = this.userId;
    if (!userId) {
      this.data = {};
      return;
    }
    const query = JSON.stringify({
      _id: userId,
    });
    let data = {};
    try {
      data = await firstValueFrom(
        this.partnersService.getUsers({ query }),
      )
    } catch (err) {
      this.alertService.errorAlert(
        (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
      );
    }
    this.data = data[0] || {};
  }
  ngOnChanges() {
    this.data = this.data || {};
  }

  updateFormGroup(formGroup: FormGroup) {
    this.formGroup = formGroup;
  }

  async saveUser() {
    try {
      this.data.partner = this.data.partner?._id || this.data.partner;
      const res = await firstValueFrom(
        this.partnersService.createUpdateUser(
          {
            body: this.data,
            populateQuery: { populate: '[{"path": "org", "select": "name"}]' },
          },
          this.isEdit,
        ),
      );

      if (res && !this.isEdit) {
        const params = {
          userID: `${res.org?.name}/${res.login}`,
          client: 'fxui',
        };

        firstValueFrom(this.authService.resetPassword(params));
      }

      if (
        this.isEdit &&
        this.currentRole &&
        this.currentRole !== this.data.role
      ) {
        await firstValueFrom(
          this.partnersService.revokeRole(res.login, this.currentRole),
        );
      }
      if (this.currentRole !== this.data.role) {
        await firstValueFrom(
          this.partnersService.addRole(res.login, { role: this.data.role }),
        );
      }
      this.alertService.successAlert('User saved successfully');
      this.router.navigate(['partners']);
    } catch (err) {
      const errorMessage =
        err.errorMessage || sharedConstants.defaultErrorMessage;

      if (err.errorMessage === 'Validation Error') {
        this.errors = this.utilsService.parseError(
          err,
          this.dbToUIFieldMappings,
        );
        if (!this.drawerService.getDrawerState()) {
          this.drawerService.setDrawerState(true);
          this.drawer.toggle();
        }

        return;
      }
      this.alertService.errorAlert(errorMessage);
    }
  }

  getPartnerName() {
    return this.partner?.name;
  }

  async checkCurrentRole() {
    if (this.isEdit || this.isView) {
      try {
        const res = await firstValueFrom(
          this.partnersService.getUserRole({ user: this.data.login }),
        );

        this.data.role = res.roles[0];
        this.currentRole = this.data.role;
        await this.onRoleChange();
      } catch (err) {
        this.alertService.errorAlert(
          (err && err.errorMessage) || sharedConstants.defaultErrorMessage,
        );
      }
    }
  }

  async getRoles() {
    try {
      return await firstValueFrom(this.partnersService.getRoles());
    } catch (err) {
      const errorMessage =
        err.errorMessage || sharedConstants.defaultErrorMessage;

      this.alertService.errorAlert(errorMessage);
    }
  }

  async onRoleChange() {
    try {
      if (!this.data.role) {
        return;
      }
      this.permissionsForRole = await firstValueFrom(
        this.partnersService.getPermissions({ role: this.data.role }),
      );
      const permissionConfigData = [];

      this.permissionsForRole.forEach((perm) => {
        Object.keys(perm).forEach((act) => {
          const obj = {
            resource: act,
            create: perm[act].create,
            read: perm[act].read,
            update: perm[act].update,
            delete: perm[act].delete,
          };

          permissionConfigData.push(obj);
        });
      });
      this.permissionConfigData = permissionConfigData;
    } catch (err) {
      const errorMessage =
        err.errorMessage || sharedConstants.defaultErrorMessage;

      this.alertService.errorAlert(errorMessage);
    }
  }

  onDrawerClosed() {
    this.drawerService.setDrawerState(false);
  }
}
