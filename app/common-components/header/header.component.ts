import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { AppComponent } from 'src/app/app.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isSidebarOpen = true;
  show = false;
  oktaSub: any;
  orgName: string;
  loggedAs: string;
  profileImgText: string;

  constructor(
    private authService: AuthService,
    private utilsService: UtilsService,
    private appComp: AppComponent,
  ) {}

  async ngOnInit() {
    await this.authService.fetchUserPermissions();
    this.oktaSub = this.authService.oktaStatusPublisher.subscribe((status) => {
      const result = this.utilsService.getUserName(status);

      if (result && Object.keys(result).length) {
        this.orgName = result.orgName;
        this.loggedAs = result.loggedAs;
        this.profileImgText = result.profileImgText;
      }
    });
  }

  logout() {
    if (!this.utilsService.getSidebarState()) {
      this.appComp.toggleSidebar();
      this.utilsService.setSidebarState(true);
    }
    this.authService.logoutUser();
  }

  ngOnDestroy() {
    this.oktaSub?.unsubscribe();
  }
}
