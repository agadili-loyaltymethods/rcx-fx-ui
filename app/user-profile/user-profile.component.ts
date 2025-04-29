import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { UiConfigService } from '../shared/services/ui-config.service';
import { UtilsService } from '../shared/services/utils.service';
import { DynamicPipeService } from 'src/app/shared/services/dynamic-pipe.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  config: any;
  uiCfg: any = [];
  userProfile: {};
  oktaSub: any;
  profileImgText: string;

  constructor(
    private authService: AuthService,
    private uiConfigService: UiConfigService,
    private utilsService: UtilsService,
    private pipeService: DynamicPipeService,
  ) {}

  async ngOnInit() {
    this.uiCfg =
      (await this.uiConfigService.getGridViewConfig('user-profile')) || {};
    // this.uiCfg.push(this.config)
    await this.authService.setUser();
    const userDetails = await this.authService.getUser('userProfile');
    const lastAPIAccess = sessionStorage.getItem('lastAPIAccess');
    const lastAccess = lastAPIAccess
      ? this.pipeService.pipes.longDateTimeFormat(lastAPIAccess)
      : '';
    const { login, email } = userDetails ? userDetails : '';

    this.userProfile = {
      firstName: login,
      email: email,
      lastAccess: lastAccess,
    };
    this.oktaSub = this.authService.oktaStatusPublisher.subscribe((status) => {
      const result = this.utilsService.getUserName(status);

      if (result && Object.keys(result).length) {
        this.profileImgText = result.profileImgText;
      }
    });
  }

  ngOnDestroy() {
    this.oktaSub.unsubscribe();
  }
}
