import { Injectable } from '@angular/core';
import { Connection } from 'src/app/models/connection';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { IntegrationsService } from './integrations.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from 'src/app/common-components/delete-button/confirmation-dialog.component';
import { ConnectionsService } from './connections.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  dashBrdFilter = localStorage.getItem('daysDuration') || 'day';
  userPermissions: any;
  private isSidebarOpen = false;
  ignoreFilterKeys = ['searchValue', 'startDate', 'endDate'];
  constructor(private authService: AuthService, private integrationsService: IntegrationsService, private dialog: MatDialog, private connectionsService: ConnectionsService, private router: Router,) {}

  userPermissionsSub = this.authService.userPermissions.subscribe(
    (perms: any) => {
      this.userPermissions = perms;
    },
  );

  setSidebarState(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  getSidebarState(): boolean {
    return this.isSidebarOpen;
  }

  async checkEdit(path, id) {
    if (!id) {
      return false;
    }
    var query,populate;
    const validStatuses = ['Paused', 'Publish Pending', 'Published'];
    if (path === 'connections') {
      query = JSON.stringify({
        $or: [
          {
            'inputProperties.connection': id,
          },
          {
            'responseProperties.connection': id,
          },
        ],
        status: { $in: validStatuses }
      })
    }
    else if (path === 'templates') {
      query = JSON.stringify({ template: id,status: { $in: validStatuses } })
      populate = JSON.stringify({ path: "template", select: 'name' })
    }
    else {
      query = JSON.stringify({ _id: id, status: { $in: validStatuses } })
    }
    const integrations = await firstValueFrom(
      this.integrationsService.getIntegrations({ query, populate }),
    );

    if (integrations.length) {
        let query = JSON.stringify({ _id: id });
        var item;
        if (path === 'connections') {
          item = await firstValueFrom(this.connectionsService.getConnections('s3', { query }));
          if (!item.length) {
            item = await firstValueFrom(this.connectionsService.getConnections('sftp', { query }));
          }
        }
        else {
          item = integrations;
        }
        this.dialog.open(ConfirmationDialog, {
          data: {
            schema: 'Warning',
            content: path === 'integrations' ? `Unable to edit a ${item.status} integration.` : `Unable to edit ${path.slice(0,-1)} <strong>${path === 'connections' ? item[0].name : item[0].template.name}</strong>, as it is used in one or more integrations.`,
            confirmButton: 'Close',
            disableCancelButton: true,
          },
        });
        return this.router.navigate([path + '/detail/' + id]); 
    }
    else
      return true;
  }

  getUserName(isOkta) {
    let orgName: string;
    let loggedAs: string;

    if (isOkta === 'true') {
      orgName = sessionStorage.getItem('org') || '';
      loggedAs = sessionStorage.getItem('RCX_username') || '';
    } else {
      const user = sessionStorage.getItem('user')
        ? sessionStorage.getItem('user').split('/')
        : [];

      orgName = user[0] || '';
      loggedAs = user[1] || '';
    }
    const profileImgText = orgName[0].toUpperCase() + loggedAs[0].toUpperCase();

    return { orgName, loggedAs, profileImgText };
  }

  async isAllowed(permObj): Promise<boolean> {
    let perms = this.authService.permissions?.userPermissions;

    if (!Object.keys(perms || {}).length) {
      perms = await this.authService.fetchUserPermissions();
      this.authService.permissions = perms;
    }

    return this.checkPerms(permObj);
  }

  checkPerms(permsObj) {
    if (!this.userPermissions) {
      return false;
    }
    for (const perm of Object.keys(permsObj)) {
      const requiredPerms = permsObj[perm];

      if (
        !requiredPerms.every(
          (k) => this.userPermissions[perm] && this.userPermissions[perm][k],
        )
      ) {
        return false;
      }
    }

    return true;
  }

  calculateDurationInSeconds(startTime: string, endTime: string): number {
    const durationInSeconds =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;

    return durationInSeconds;
  }

  calculateDuration(startTime: string, endTime: string) {
    let duration =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
    let result = '';

    if (duration > 3600) {
      result = Math.floor(duration / 3600) + 'h ';
      duration = duration % 3600;
    }
    if (duration > 60) {
      result += Math.floor(duration / 60) + 'm ';
      duration = duration % 60;
    }
    if (duration) {
      result += duration + 's';
    }

    return result;
  }

  parseError(error: any, fieldMappings: any) {
    const errors = [];
    const errorMessagesMap = {
      unique: 'This %s is already taken, please try with another one.',
      required: '%s is required',
      regexp: '%s is invalid.',
      maxlength: '%s length should not exceed %s characters',
    };

    if (error.errors?.length) {
      for (const eachError of error.errors) {
        let errorMessage;

        if (fieldMappings[eachError.path] === 'IGNORE') {
          continue;
        }
        if (errorMessagesMap[eachError.kind] && fieldMappings[eachError.path]) {
          errorMessage = errorMessagesMap[eachError.kind].replace(
            '%s',
            fieldMappings[eachError.path],
          );
          if (eachError.kind === 'maxlength') {
            let message = eachError.message.split(' ');

            message = message[message.length - 1];
            const maxLength = message.substring(1, message.length - 2);

            errorMessage = errorMessage.replace('%s', maxLength);
          }
        }
        errors.push(errorMessage || eachError.message);
      }
    }

    return errors;
  }

  setFilters(value: string) {
    localStorage.setItem('daysDuration', value)
    this.dashBrdFilter = localStorage.getItem('daysDuration');
  }
  
  getFilters() {
    let duration = localStorage.getItem('daysDuration');
    if (!duration) {
      duration = 'day';
      localStorage.setItem('daysDuration', duration);
    }
    this.dashBrdFilter = duration;
    return duration;
  }
  

  addFiletrs(input: any, field?: string, cfg?: any) {
    let value: any;
    if (input?.length > 0) {
      if (typeof input === 'object') {
        value = input.map((el) => {
          return el.name;
        });
        cfg.filters[field] = value;
      } else {
        value = input;
        if (!field) {
          cfg.filters['searchValue'] = value;
        } else {
          cfg.filters[field] = value;
          if (cfg.filters[field] === 'all') delete cfg.filters[field];
        }
      }
    } else {
      if (field) delete cfg.filters[field];
    }
  }

  setPageFilters(page, data) {
    Object.keys(data).forEach((key) => {
      if (!data[key] || data[key].length === 0) {
        delete data[key];
      }
    });
    localStorage.setItem(`__${page}_filters`, JSON.stringify(data));
  }
  
  getPageFilters(page) {
    return JSON.parse(localStorage.getItem(`__${page}_filters`) || '{}');
  }
  
  resetPageFilters(page) {
    localStorage.removeItem(`__${page}_filters`);
  }
  
  filterListData(_self) {
    const filters = this.getPageFilters(_self.pageName);
    Object.keys(filters).forEach((key) => {
      if (this.ignoreFilterKeys.includes(key) || key === 'status') {
        _self[key] = filters[key];
      }
      _self.config.filters[key] = filters[key];
    });
    _self.data = this.filterData(_self.dataCollection, _self.config);
  }

  resetFilters(_self, page) {
    _self.searchValue = '';
    _self.inputFieldValue = [];
    _self.config.filters = {};
    _self.data = _self.dataCollection;
    this.resetPageFilters(page);
  }

  onChange(_self, options, updateData = true) {
    if (!options || typeof options !== 'object') {
      return; 
    }
    const { input, fieldName } = options;

    _self.config.filters['searchValue'] = _self.searchValue;
    this.addFiletrs(input, fieldName, _self.config);
    if (updateData) {
      _self.data = this.filterData(JSON.parse(JSON.stringify(_self.dataCollection)), _self.config);
    }
    const filters = this.getPageFilters(_self.pageName);

    if (fieldName && Array.isArray(input)) {
      filters[fieldName] = input?.map((v) => v.name) || [];
    } else {
      if (fieldName && fieldName !== 'searchValue') {
        filters[fieldName] = input;
        if (input === 'all') {
          delete filters[fieldName];
        }
      }
    }
    if (!fieldName || fieldName === 'searchValue') {
      filters['searchValue'] = _self.searchValue;
    }
    this.setPageFilters(_self.pageName, filters);
  }

  filterData(data: any[], cfg: any) {
        const cfgStartDate = cfg.startDate || cfg.filters.startDate;
    const cfgEndDate = cfg.endDate || cfg.filters.endDate;
    if (cfgStartDate && cfgEndDate) {
      const dateRangeFilter = data.filter((row) => {
        const startTime = new Date(row.startTime).getTime();
        const endTime = row.endTime ? new Date(row.endTime).getTime() : null;
        const startDate = new Date(cfgStartDate).getTime();
        const endDate = new Date(cfgEndDate).getTime();

        if (
          (endTime <= endDate &&
            startTime >= startDate &&
            startTime < endDate) ||
          (!endTime && startTime >= startDate && startTime < endDate)
        )
          return row;
      });

      data = dateRangeFilter;
    }

    for (const key in cfg.filters) {
      if (this.ignoreFilterKeys.includes(key)) {
        continue;
      }
      let filter = cfg.filters[key];
      if (!Array.isArray(filter)) {
        filter = [filter];
      }
      data = data.filter((row) => {
        if (row[key] === false) row[key] = 'Invalid';
        if (row[key] === true) row[key] = 'Valid';
        if (
          eval(`row.${key}`) !== 'undefined' &&
          eval(`row.${key}`) !== null &&
          filter.includes(eval(`row.${key}`))
        )
          return row;
      });
    }

    const searchFilter = ('' + cfg.filters['searchValue']).toLowerCase();
    const titleList = ['Templates', 'Connections', 'Integration'];

    if (searchFilter === 'undefined') return data;

    if (cfg.title === 'Partner') {
      data = data.filter((el) => {
        if (el.name && el.name.toLowerCase().includes(searchFilter)) return el;
      });
    } else if (titleList.includes(cfg.title)) {
      data = data.filter((el) => {
        if (
          (el.name && el.name.toLowerCase().includes(searchFilter)) ||
          (el.description &&
            el.description.toLowerCase().includes(searchFilter))
        )
          return el;
      });
    } else if (cfg.title === 'Run History') {
      data = data.filter((el) => {
        if (
          (el.integrationId?.name &&
            el.integrationId?.name.toLowerCase().includes(searchFilter)) ||
          (el.runId && el.runId.toLowerCase().includes(searchFilter))
        )
          return el;
      });
    }

    return data;
  }

  removeEmptyFields(formValues) {
    delete formValues.partnerFormControl;

    Object.keys(formValues).forEach((key) => {
      if (formValues[key] === undefined) {
        delete formValues[key];
      }
    });

    return formValues;
  }

  prepareConnectionsForTest(connections: Connection[]) {
    return connections.map((con: Connection) => {
      const {
        name,
        url,
        userName,
        password,
        accessKeyId,
        secretAccessKey,
        region,
        _id,
        connectionType,
      } = con;

      return {
        name,
        url,
        userName,
        password,
        accessKeyId,
        secretAccessKey,
        region,
        _id,
        connectionType,
      };
    });
  }

  filterTemplateData(templateData) {
    const layouts = ['inputFileLayout', 'responseFileLayout'];

    const processFileProperties = (item) => {
      layouts.forEach(layout => {
        const fileProperties = item?.[layout]?.fileProperties;

        if (fileProperties) {
          if (!fileProperties.header) delete item[layout].headerFieldDefs;
          if (!fileProperties.footer) delete item[layout].footerFieldDefs;
          if (layout === 'responseFileLayout' && !fileProperties.body) delete item[layout].bodyFieldDefs;
        }
      });
    };

    if (templateData.isExport) {
      templateData?.data?.forEach(processFileProperties);
      return templateData?.data;
    } else {
      processFileProperties(templateData);
      return templateData;
    }
  }
}
