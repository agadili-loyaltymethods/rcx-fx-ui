import { useState, useEffect, useCallback } from 'react';
// import { Connection } from '../models/connection';
// import { useConnections } from '../connections';
import { useNavigate } from 'react-router-dom';
// import { useRouter } from 'next/router';

export const useUtils = () => {
  const navigate = useNavigate();
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [dashBrdFilter, setDashBrdFilter] = useState<string>(
    localStorage.getItem('daysDuration') || 'day'
  );
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const ignoreFilterKeys = ['searchValue', 'startDate', 'endDate'];

  // Simulated service functions that would need to be implemented separately
  const fetchIntegrations = async (params: any) => {
    // This would be replaced with actual API call
    return [];
  };

  const fetchConnections = async (type: string, params: any) => {
    // This would be replaced with actual API call
    return [];
  };

  const openConfirmationDialog = (data: any) => {
    // This would be implemented with your preferred dialog component
    console.log('Dialog would open with:', data);
  };

  useEffect(() => {
    // Simulating the subscription to userPermissions
    const userPermissionsSub = {
      unsubscribe: () => {}
    };

    return () => {
      userPermissionsSub.unsubscribe();
    };
  }, []);

  const setSidebarState = useCallback((isOpen: boolean): void => {
    setSidebarOpen(isOpen);
  }, []);

  const getSidebarState = useCallback((): boolean => {
    return isSidebarOpen;
  }, [isSidebarOpen]);

  const checkEdit = useCallback(async (path: string, id: string) => {
    if (!id) {
      return false;
    }
    
    let query, populate;
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
      });
    }
    else if (path === 'templates') {
      query = JSON.stringify({ template: id, status: { $in: validStatuses } });
      populate = JSON.stringify({ path: "template", select: 'name' });
    }
    else {
      query = JSON.stringify({ _id: id, status: { $in: validStatuses } });
    }
    
    const integrations = await fetchIntegrations({ query, populate });
    
    if (integrations.length) {
      let query = JSON.stringify({ _id: id });
      let item: any;
      if (path === 'connections') {
        item = await fetchConnections('s3', { query });
        if (!item.length) {
          item = await fetchConnections('sftp', { query });
        }
      }
      else {
        item = integrations;
      }
      
      openConfirmationDialog({
        schema: 'Warning',
        content: path === 'integrations' 
          ? `Unable to edit a ${item.status} integration.` 
          : `Unable to edit ${path.slice(0,-1)} <strong>${path === 'connections' ? item[0].name : item[0].template.name}</strong>, as it is used in one or more integrations.`,
        confirmButton: 'Close',
        disableCancelButton: true,
      });
      
      return navigate(`${path}/detail/${id}`);
    }
    else {
      return true;
    }
  }, [navigate]);

  const getUserName = useCallback((isOkta: string) => {
    let orgName: string;
    let loggedAs: string;
    
    if (isOkta === 'true') {
      orgName = sessionStorage.getItem('org') || '';
      loggedAs = sessionStorage.getItem('RCX_username') || '';
    } else {
      const user = sessionStorage.getItem('user')
        ? sessionStorage.getItem('user')?.split('/')
        : [];
      orgName = user?.[0] || '';
      loggedAs = user?.[1] || '';
    }
    
    const profileImgText = orgName.charAt(0).toUpperCase() + loggedAs.charAt(0).toUpperCase();
    return { orgName, loggedAs, profileImgText };
  }, []);

  const isAllowed = useCallback(async (permObj: any): Promise<boolean> => {
    // Would need implementation of auth service
    return checkPerms(permObj);
  }, []);

  const checkPerms = useCallback((permsObj: any) => {
    if (!userPermissions) {
      return false;
    }
    
    for (const perm of Object.keys(permsObj)) {
      const requiredPerms = permsObj[perm];
      if (
        !requiredPerms.every(
          (k: string) => userPermissions[perm] && userPermissions[perm][k],
        )
      ) {
        return false;
      }
    }
    
    return true;
  }, [userPermissions]);

  const calculateDurationInSeconds = useCallback((startTime: string, endTime: string): number => {
    const durationInSeconds =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
    return durationInSeconds;
  }, []);

  const calculateDuration = useCallback((startTime: string, endTime: string) => {
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
  }, []);

  const parseError = useCallback((error: any, fieldMappings: any) => {
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
        
        if (errorMessagesMap[eachError.kind as keyof typeof errorMessagesMap] && fieldMappings[eachError.path]) {
          errorMessage = errorMessagesMap[eachError.kind as keyof typeof errorMessagesMap].replace(
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
  }, []);

  const setFilters = useCallback((value: string) => {
    localStorage.setItem('daysDuration', value);
    setDashBrdFilter(localStorage.getItem('daysDuration') || value);
  }, []);

  const getFilters = useCallback(() => {
    let duration = localStorage.getItem('daysDuration');
    if (!duration) {
      duration = 'day';
      localStorage.setItem('daysDuration', duration);
    }
    setDashBrdFilter(duration);
    return duration;
  }, []);

  const addFiletrs = useCallback((input: any, field?: any, cfg?: any) => {
    let value: any;
    if (input?.length > 0) {
      if (typeof input === 'object') {
        value = input.map((el: any) => el.name);
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
  }, []);

  const setPageFilters = useCallback((page: string, data: any) => {
    Object.keys(data).forEach((key) => {
      if (!data[key] || data[key].length === 0) {
        delete data[key];
      }
    });
    localStorage.setItem(`__${page}_filters`, JSON.stringify(data));
  }, []);

  const getPageFilters = useCallback((page: string) => {
    return JSON.parse(localStorage.getItem(`__${page}_filters`) || '{}');
  }, []);

  const resetPageFilters = useCallback((page: string) => {
    localStorage.removeItem(`__${page}_filters`);
  }, []);

  const filterListData = useCallback((_self: any) => {
    const filters = getPageFilters(_self.pageName);
    Object.keys(filters).forEach((key) => {
      if (ignoreFilterKeys.includes(key) || key === 'status') {
        _self[key] = filters[key];
      }
      _self.config.filters[key] = filters[key];
    });
    _self.data = filterData(_self.dataCollection, _self.config);
  }, []);

  const resetFilters = useCallback((_self: any, page: string) => {
    _self.searchValue = '';
    _self.inputFieldValue = [];
    _self.config.filters = {};
    _self.data = _self.dataCollection;
    resetPageFilters(page);
  }, []);

  const onChange = useCallback((_self: any, options: any, updateData = true) => {
    if (!options || typeof options !== 'object') {
      return;
    }
    const { input, fieldName } = options;
    _self.config.filters['searchValue'] = _self.searchValue;
    addFiletrs(input, fieldName, _self.config);
    
    if (updateData) {
      _self.data = filterData(JSON.parse(JSON.stringify(_self.dataCollection)), _self.config);
    }
    
    const filters = getPageFilters(_self.pageName);
    if (fieldName && Array.isArray(input)) {
      filters[fieldName] = input?.map((v: any) => v.name) || [];
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
    setPageFilters(_self.pageName, filters);
  }, []);

  const filterData = useCallback((data: any[], cfg: any) => {
    const cfgStartDate = cfg.startDate || cfg.filters.startDate;
    const cfgEndDate = cfg.endDate || cfg.filters.endDate;
    
    if (cfgStartDate && cfgEndDate) {
      const dateRangeFilter = data.filter((row) => {
        const startTime = new Date(row.startTime).getTime();
        const endTime = row.endTime ? new Date(row.endTime).getTime() : null;
        const startDate = new Date(cfgStartDate).getTime();
        const endDate = new Date(cfgEndDate).getTime();
        
        if (
          (endTime && endTime <= endDate &&
            startTime >= startDate &&
            startTime < endDate) ||
          (!endTime && startTime >= startDate && startTime < endDate)
        )
          return row;
        return false;
      });
      data = dateRangeFilter;
    }
    
    for (const key in cfg.filters) {
      if (ignoreFilterKeys.includes(key)) {
        continue;
      }
      let filter = cfg.filters[key];
      if (!Array.isArray(filter)) {
        filter = [filter];
      }
      data = data.filter((row) => {
        if (row[key] === false) row[key] = 'Invalid';
        if (row[key] === true) row[key] = 'Valid';
        // Using a safer way to access nested properties
        const getValue = (obj: any, path: string) => {
          return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
        };
        
        if (
          getValue(row, key) !== undefined &&
          getValue(row, key) !== null &&
          filter.includes(getValue(row, key))
        )
          return true;
        return false;
      });
    }
    
    const searchFilter = ('' + (cfg.filters['searchValue'] || '')).toLowerCase();
    const titleList = ['Templates', 'Connections', 'Integration'];
    
    if (searchFilter === 'undefined') return data;
    
    if (cfg.title === 'Partner') {
      data = data.filter((el) => {
        if (el.name && el.name.toLowerCase().includes(searchFilter)) return true;
        return false;
      });
    } else if (titleList.includes(cfg.title)) {
      data = data.filter((el) => {
        if (
          (el.name && el.name.toLowerCase().includes(searchFilter)) ||
          (el.description &&
            el.description.toLowerCase().includes(searchFilter))
        )
          return true;
        return false;
      });
    } else if (cfg.title === 'Run History') {
      data = data.filter((el) => {
        if (
          (el.integrationId?.name &&
            el.integrationId?.name.toLowerCase().includes(searchFilter)) ||
          (el.runId && el.runId.toLowerCase().includes(searchFilter))
        )
          return true;
        return false;
      });
    }
    return data;
  }, []);

  const removeEmptyFields = useCallback((formValues: any) => {
    delete formValues.partnerFormControl;
    Object.keys(formValues).forEach((key) => {
      if (formValues[key] === undefined) {
        delete formValues[key];
      }
    });
    return formValues;
  }, []);

  const prepareConnectionsForTest = useCallback((connections: any[]) => {
    return connections.map((con: any) => {
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
  }, []);

const filterTemplateData = useCallback((templateData: any) => {
    const layouts = ['inputFileLayout', 'responseFileLayout'];
    
    const processFileProperties = (item: any) => {
      layouts.forEach(layout => {
        const fileProperties = item?.[layout]?.fileProperties;
        if (fileProperties) {
          if (!fileProperties.header) delete item[layout].headerFieldDefs;
          if (!fileProperties.footer) delete item[layout].footerFieldDefs;
          if (layout === 'responseFileLayout' && !fileProperties.body) {
            delete item[layout].bodyFieldDefs;
          }
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
  }, []);
  
  return {
  // State getters
  userPermissions,
  dashBrdFilter,
  ignoreFilterKeys,
  
  // Sidebar state management
  setSidebarState,
  getSidebarState,
  
  // Data operations
  checkEdit,
  getUserName,
  isAllowed,
  checkPerms,
  
  // Time calculations
  calculateDurationInSeconds,
  calculateDuration,
  
  // Error handling
  parseError,
  
  // Filter operations
  setFilters,
  getFilters,
  addFiletrs,
  setPageFilters,
  getPageFilters,
  resetPageFilters,
  filterListData,
  resetFilters,
  onChange,
  filterData,
  
  // Data processing
  removeEmptyFields,
  prepareConnectionsForTest,
  filterTemplateData
};
};