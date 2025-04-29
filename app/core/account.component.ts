import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UiConfigService } from 'src/app/shared/services/ui-config.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private uiConfigService: UiConfigService,
  ) {}

  memberId: any;
  sub: any;
  loyaltyID: any;
  segmentCheck: any;
  memberloyaltyID: any;
  memberHasDisabledSegment: boolean;
  permSubscriber: any;
  permissions: any;
  memberInfo: any = {};
  labels: any;
  title: any;
  breadCrumbCfg: any;
  breadCrumbExtCfg: any;
  isExpanded = true;
  async ngOnInit() {
    await this.uiConfigService.init();
    const cfg = await this.uiConfigService.getConfig('account');

    this.breadCrumbCfg = cfg['bread-crumb'];
    this.breadCrumbExtCfg = cfg['bread-crumb-ext'];
    this.labels = cfg.labels;
  }

  hasPermissions() {
    return this.permissions && Object.keys(this.permissions).length > 0;
  }

  isAllowed(path, type?: string) {
    return true;
    // if (!this.hasPermissions()) {
    //   return false;
    // }
    // if (!type) {
    //   type = 'read';
    // }
    // const model = this.memberAccountService.pathPermissionMap[path];
    // return !!this.permissions[model] && this.permissions[model][type];
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.loyaltyID.unsubscribe();
    this.segmentCheck.unsubscribe();
    this.permSubscriber.unsubscribe();
  }
}
