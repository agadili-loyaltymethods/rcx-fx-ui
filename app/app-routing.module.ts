import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectionCreateTemplateComponent } from './connections/connection-create-template/connection-create-template.component';
import { ConnectionListComponent } from './connections/connection-list/connection-list.component';
import { ConnectionsTableComponent } from './connections/connections-table/connections-table.component';
import { ConnectionsComponent } from './connections/connections.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateIntegrationComponent } from './integration/create-integration/create-integration.component';
import { IntegrationComponent } from './integration/integration.component';
import { ViewIntegrationComponent } from './integration/view-integration/view-integration.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { CreatePartnerComponent } from './partner/create-partner/create-partner.component';
import { CreateUserComponent } from './partner/create-user/create-user.component';
import { PartnerComponent } from './partner/partner.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RunHistoryComponent } from './run-history/run-history.component';
import { AuthGuard } from './shared/helpers/auth.guard';
import { CanDeactivateGuard } from './shared/helpers/can-deactivate.guard';
import { RouteGuard } from './shared/helpers/route.guard';
import { CreateTemplateComponent } from './templates/create-template/create-template.component';
import { TemplatesComponent } from './templates/templates.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user-profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'integrations',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: IntegrationComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'view',
        component: ViewIntegrationComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'create',
        component: CreateIntegrationComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RouteGuard],
      },
      {
        path: 'detail/:id',
        component: CreateIntegrationComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'edit/:id',
        component: CreateIntegrationComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RouteGuard],
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'run-history',
    component: RunHistoryComponent,
    canActivate: [AuthGuard, RouteGuard],
  },
  {
    path: 'templates',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: TemplatesComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'detail/:id',
        component: CreateTemplateComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'create',
        component: CreateTemplateComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RouteGuard],
      },
      {
        path: 'edit/:id',
        component: CreateTemplateComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RouteGuard],
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'partners',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: PartnerComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'create',
        component: CreatePartnerComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RouteGuard],
      },
      {
        path: 'edit/:id',
        component: CreatePartnerComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RouteGuard],
      },
      {
        path: 'detail/:id',
        component: CreatePartnerComponent,
        canActivate: [RouteGuard],
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    children: [
      {
        path: 'create',
        component: CreateUserComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'edit/:id',
        component: CreateUserComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'detail/:id',
        component: CreateUserComponent,
        canActivate: [RouteGuard],
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'connections',
    component: ConnectionsComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: ConnectionsTableComponent,
        canActivate: [RouteGuard],
      },
      {
        path: 'create',
        component: ConnectionCreateTemplateComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RouteGuard],
      },
      {
        path: 'edit/:id',
        component: ConnectionCreateTemplateComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RouteGuard],
      },
      {
        path: 'detail/:id',
        component: ConnectionCreateTemplateComponent,
        canActivate: [RouteGuard],
      },
    ],
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
