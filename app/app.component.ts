import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from './shared/services/alert.service';
import { AuthService } from './shared/services/auth.service';
import { LoaderService } from './shared/services/loader.service';
import { UtilsService } from './shared/services/utils.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  trustedLogo: SafeHtml = '';
  isSidebarOpen = false;
  showSpinner: boolean;
  subscriptions: Subscription[] = [];
  constructor(
    private domSanitizer: DomSanitizer,
    private http: HttpClient,
    private authService: AuthService,
    private loaderService: LoaderService,
    public utilService: UtilsService, //this is used in HTML file, please don't remove it
    private router: Router,
    private alertService: AlertService,
  ) {}

  title = 'rcx';

  ngOnInit() {
    this.utilService.setSidebarState(true);
    this.toggleSidebar();
    this.fetchLogo();
    this.subscribeToRouterEvents();
  }

  private subscribeToRouterEvents() {
    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          if (this.alertService.snackBarRef) {
            if (
              this.alertService.snackBarRef.containerInstance.snackBarConfig
                .panelClass !== 'bg-success'
            ) {
              this.alertService.closeAlert();
            }
          }
        }
      }),
    );
  }

  fetchLogo(): void {
    this.http
      .get('assets/logo.svg', { responseType: 'text' })
      .subscribe((svgContent: string) => {
        this.trustedLogo =
          this.domSanitizer.bypassSecurityTrustHtml(svgContent);
      });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.utilService.setSidebarState(this.isSidebarOpen);
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngAfterViewInit() {
    this.subscriptions.push(
      this.loaderService.getIsLoading().subscribe((val) => {
        setTimeout(() => {
          this.showSpinner = val;
        });
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
