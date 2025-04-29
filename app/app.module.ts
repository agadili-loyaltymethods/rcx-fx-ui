import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxEchartsModule } from 'ngx-echarts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IntegrationComponent } from './integration/integration.component';
import { TemplatesComponent } from './templates/templates.component';
import { PartnerComponent } from './partner/partner.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateTemplateComponent } from './templates/create-template/create-template.component';
import { ObserversModule } from '@angular/cdk/observers';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatTreeModule } from '@angular/material/tree';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from './app.material.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PartnerTableComponent } from './partner/partner-table/partner-table.component';
import { PartnerListComponent } from './partner/partner-list/partner-list.component';
import { CreatePartnerComponent } from './partner/create-partner/create-partner.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PartnerDetailsComponent } from './partner/partner-details/partner-details.component';
import { ConnectionsComponent } from './connections/connections.component';
import { ConnectionsTableComponent } from './connections/connections-table/connections-table.component';
import { ConnectionListComponent } from './connections/connection-list/connection-list.component';
import { ConnectionCreateTemplateComponent } from './connections/connection-create-template/connection-create-template.component';
import { ConnectionDetailsComponent } from './connections/connection-detail/connection-detail.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { DeleteButtonComponent } from './common-components/delete-button/delete-button.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from './common-components/header/header.component';
import { SvgIconsComponent } from './common-components/svg-icons/svg-icons.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { FailedIntegrationsComponent } from './dashboard/failed-integrations/failed-integrations.component';
import { ProcessingSucceededIntegrationsComponent } from './dashboard/processing-succeeded-integrations/processing-succeeded-integrations.component';
import { IntegrationOperationsChartComponent } from './dashboard/integration-operations-chart/integration-operations-chart.component';
import { RunHistoryComponent } from './run-history/run-history.component';
import { DynamicTableComponent } from './common-components/dynamic-table/dynamic-table.component';
import { TableFilterComponent } from './common-components/table-filter/table-filter.component';
import { ExecutionLogDialogComponent } from './common-components/execution-log-dialog/execution-log-dialog.component';
import { CdkColumnDef } from '@angular/cdk/table';
import { CreateIntegrationComponent } from './integration/create-integration/create-integration.component';
import { ViewIntegrationComponent } from './integration/view-integration/view-integration.component';
import { EditIntegrationComponent } from './integration/edit-integration/edit-integration.component';
import { FormHeaderComponent } from './integration/common/form-header/form-header.component';
import { InputPropertiesComponent } from './integration/common/input-properties/input-properties.component';
import { ResponsePropertiesComponent } from './integration/common/response-properties/response-properties.component';
import { SchedulingPropertiesComponent } from './integration/common/scheduling-properties/scheduling-properties.component';
import { AlertsPropertiesComponent } from './integration/common/alerts-properties/alerts-properties.component';
import { DependenciesPropertiesComponent } from './integration/common/dependencies-properties/dependencies-properties.component';
import { ErrorCodeMappingPropertiesComponent } from './integration/common/error-code-mapping-properties/error-code-mapping-properties.component';
import { CreateEditErrorCodeMappingComponent } from './integration/common/create-edit-error-code-mapping/create-edit-error-code-mapping.component';
import { CreateEditDependencyComponent } from './integration/common/create-edit-dependency/create-edit-dependency.component';
import { CreateEditAlertComponent } from './integration/common/create-edit-alert/create-edit-alert.component';
import { ConfirmationDialog } from './common-components/delete-button/confirmation-dialog.component';
import { IntegrationListComponent } from './integration/integration-list/integration-list.component';
import { IntegrationGridComponent } from './integration/integration-grid/integration-grid.component';
import { IntegrationPropertiesComponent } from './integration/common/integration-properties/integration-properties.component';
import { IntegrationPropertiesMenuComponent } from './integration/common/integration-properties-menu/integration-properties-menu.component';
import { StatusFilterComponent } from './common-components/status-filter/status-filter.component';
import { TableSearchComponent } from './common-components/table-search/table-search.component';
import { ErrorSidePanelComponent } from './common-components/error-side-panel/error-side-panel.component';
import { StatusCardsComponent } from './dashboard/status-cards/status-cards.component';
import { TemplatePropertiesTreeSectionComponent } from './templates/common/template-properties-tree-section/template-properties-tree-section.component';
import { InputFilePropertiesComponent } from './templates/common/input-file-properties/input-file-properties.component';
import { InputHeaderPropertiesComponent } from './templates/common/input-header-properties/input-header-properties.component';
import { InputBodyPropertiesComponent } from './templates/common/input-body-properties/input-body-properties.component';
import { InputFooterPropertiesComponent } from './templates/common/input-footer-properties/input-footer-properties.component';
import { ResponseFooterPropertiesComponent } from './templates/common/response-footer-properties/response-footer-properties.component';
import { ResponseFilePropertiesComponent } from './templates/common/response-file-properties/response-file-properties.component';
import { ResponseBodyPropertiesComponent } from './templates/common/response-body-properties/response-body-properties.component';
import { ResponseHeaderPropertiesComponent } from './templates/common/response-header-properties/response-header-properties.component';
import { RcxFieldSelectionComponent } from './templates/common/rcx-field-selection/rcx-field-selection.component';
import { DateFormatInfoComponent } from './templates/common/date-format-info/date-format-info.component';
import { TemplateListComponent } from './templates/template-list/template-list.component';
import { TemplateGridComponent } from './templates/template-grid/template-grid.component';
import { TemplatePropertiesComponent } from './templates/common/template-properties/template-properties.component';
import { EditTemplateComponent } from './templates/edit-template/edit-template.component';
import { ViewTemplateComponent } from './templates/view-template/view-template.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RunHistoryDialogComponent } from './run-history/run-history-dialog/run-history-dialog.component';
import { DropDownWithSearchComponent } from './common-components/drop-down-with-search/drop-down-with-search.component';
import { GlobalTableSearchComponent } from './common-components/global-table-search/global-table-search.component';
import { EncodeHttpParamsInterceptorService } from './shared/interceptors/encode-params-interceptor.service';
import { TokenInterceptorService } from './shared/interceptors/token-interceptor.service';
import { LoginComponent } from './login/login.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TreeViewModalComponent } from './common-components/tree-view-modal/tree-view-modal.component';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { DynamicGridComponent } from './common-components/dynamic-grid/dynamic-grid.component';
import { DynamicFormComponent } from './common-components/dynamic-form/dynamic-form.component';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
} from '@angular-material-components/datetime-picker';
import { CreateUserComponent } from './partner/create-user/create-user.component';
import { IntegrationParametersComponent } from './integration/common/integration-parameters/integration-parameters.component';
import { CreateEditIntegrationParameterComponent } from './integration/common/create-edit-integration-parameter/create-edit-integration-parameter.component';
import { EllipsisDirective } from './shared/directives/ellipsis.directive';
import { TextTrimPipe } from './shared/pipes/text-trim.pipe';
import { AutoFocusDirective } from './shared/directives/auto-focus.directive';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UrlSerializer } from '@angular/router';
import { CustomUrlSerializer } from './shared/helpers/customUrlSerializer';
import { LogoutComponent } from './logout/logout.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ToolbarComponent,
    SidebarComponent,
    DashboardComponent,
    IntegrationComponent,
    PartnerComponent,
    TemplateListComponent,
    TemplateGridComponent,
    CreateTemplateComponent,
    TemplatePropertiesComponent,
    PartnerTableComponent,
    PartnerListComponent,
    CreatePartnerComponent,
    PartnerDetailsComponent,
    ConnectionsComponent,
    ConnectionsTableComponent,
    ConnectionListComponent,
    ConnectionCreateTemplateComponent,
    ConnectionDetailsComponent,
    DeleteButtonComponent,
    HeaderComponent,
    SvgIconsComponent,
    UserProfileComponent,
    FailedIntegrationsComponent,
    ProcessingSucceededIntegrationsComponent,
    IntegrationOperationsChartComponent,
    RunHistoryComponent,
    DynamicTableComponent,
    TableFilterComponent,
    ExecutionLogDialogComponent,
    CreateIntegrationComponent,
    ViewIntegrationComponent,
    EditIntegrationComponent,
    FormHeaderComponent,
    InputPropertiesComponent,
    ResponsePropertiesComponent,
    SchedulingPropertiesComponent,
    AlertsPropertiesComponent,
    DependenciesPropertiesComponent,
    ErrorCodeMappingPropertiesComponent,
    CreateEditErrorCodeMappingComponent,
    CreateEditDependencyComponent,
    CreateEditAlertComponent,
    IntegrationListComponent,
    IntegrationGridComponent,
    IntegrationPropertiesComponent,
    IntegrationPropertiesMenuComponent,
    StatusFilterComponent,
    TableSearchComponent,
    ErrorSidePanelComponent,
    StatusCardsComponent,
    TemplatePropertiesTreeSectionComponent,
    InputFilePropertiesComponent,
    InputHeaderPropertiesComponent,
    InputBodyPropertiesComponent,
    InputFooterPropertiesComponent,
    ResponseFooterPropertiesComponent,
    ResponseFilePropertiesComponent,
    ResponseBodyPropertiesComponent,
    ResponseHeaderPropertiesComponent,
    DateFormatInfoComponent,
    TemplatesComponent,
    RcxFieldSelectionComponent,
    EditTemplateComponent,
    ViewTemplateComponent,
    RunHistoryDialogComponent,
    DropDownWithSearchComponent,
    GlobalTableSearchComponent,
    ConfirmationDialog,
    DynamicGridComponent,
    DynamicFormComponent,
    CreateUserComponent,
    IntegrationParametersComponent,
    CreateEditIntegrationParameterComponent,
    EllipsisDirective,
    TextTrimPipe,
    AutoFocusDirective,
    ResetPasswordComponent,
    LogoutComponent,
    TreeViewModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    ObserversModule,
    CdkTreeModule,
    MatTreeModule,
    MatRadioModule,
    ScrollingModule,
    MatSlideToggleModule,
    MatMenuModule,
    NgxMatSelectSearchModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    DragDropModule,
    MaterialModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxEchartsModule.forRoot({
      /**
       * This will import all modules from echarts.
       * If you only need custom modules,
       * please refer to [Custom Build] section.
       */
      echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    { provide: UrlSerializer, useClass: CustomUrlSerializer },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EncodeHttpParamsInterceptorService,
      multi: true,
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    CdkColumnDef,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
