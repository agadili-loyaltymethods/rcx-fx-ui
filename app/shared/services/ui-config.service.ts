import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UiConfigService {
  config: any = {};
  constructor(private authService: AuthService) {}

  async importConfig() {
    return import(`./config/${'config'}.json`)
      .then((data) => {
        this.config = data || {};

        return this.config;
      })
      .catch(() => {
        this.config = {};
        if (this.authService.isLoggedIn()) {
          // this.alertService.errorAlert('Unable to load config');
        }

        return this.config;
      });
  }

  async getListViewConfig(path) {
    await this.importConfig();
    const pathConfig = this.config[path];
    const result =
      pathConfig && pathConfig.listView ? pathConfig.listView : { data: [] };

    result.title = pathConfig.Title;

    return result;
  }

  async getGridViewConfig(path) {
    await this.importConfig();
    const pathConfig = this.config[path];
    const result =
      pathConfig && pathConfig.gridView ? pathConfig.gridView : { data: [] };

    return result;
  }

  async getFormViewConfig(path) {
    await this.importConfig();
    const pathConfig = this.config[path];
    const result =
      pathConfig && pathConfig.formView ? pathConfig.formView : { data: {} };

    return result;
  }

  async getDialogConfig(path) {
    await this.importConfig();
    const pathConfig = this.config[path];
    const result =
      pathConfig && pathConfig.dialogView
        ? pathConfig.dialogView
        : { data: [] };

    return result;
  }

  async getStatusCardCfg(path) {
    await this.importConfig();
    const pathConfig = this.config[path];
    const result =
      pathConfig && pathConfig.statusCards
        ? pathConfig.statusCards
        : { data: [] };

    return result;
  }

  async importCommonProperties(property?: string) {
    const cfg = await this.importConfig();

    if (
      property &&
      cfg['commonProperties'] &&
      cfg['commonProperties'][property]
    ) {
      return cfg['commonProperties'][property];
    }

    return cfg['commonProperties'] || {};
  }

  async importRCXIgnoreFields() {
    const cfg = await this.importConfig();

    return cfg['rcxIgnoreFields'] || {};
  }

  async getRoutePermission() {
    const cfg = await this.importConfig();

    return cfg['routePermission'];
  }
}
