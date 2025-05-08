import { useCallback } from 'react';
import { useAuth } from '../auth/useAuth';
import { useAlert } from '../alert/useAlert';

export const useUiConfig = () => {
  const { isLoggedIn } = useAuth();
  const alert = useAlert();
  let config: any = {};

  const importConfig = useCallback(async () => {
    try {
      const data = await import('@/config/config.json');
      config = data || {};
      return config;
    } catch (error) {
      config = {};
      if (isLoggedIn()) {
        alert.errorAlert('Unable to load config');
      }
      return config;
    }
  }, [isLoggedIn, alert]);

  const getListViewConfig = useCallback(async (path: string) => {
    await importConfig();
    const pathConfig = config[path];
    const result = pathConfig && pathConfig.listView ? pathConfig.listView : { data: [] };
    result.title = pathConfig.Title;
    return result;
  }, [importConfig]);

  const getGridViewConfig = useCallback(async (path: string) => {
    await importConfig();
    const pathConfig = config[path];
    const result = pathConfig && pathConfig.gridView ? pathConfig.gridView : { data: [] };
    return result;
  }, [importConfig]);

  const getFormViewConfig = useCallback(async (path: string) => {
    await importConfig();
    const pathConfig = config[path];
    const result = pathConfig && pathConfig.formView ? pathConfig.formView : { data: {} };
    return result;
  }, [importConfig]);

  const getDialogConfig = useCallback(async (path: string) => {
    await importConfig();
    const pathConfig = config[path];
    const result = pathConfig && pathConfig.dialogView ? pathConfig.dialogView : { data: [] };
    return result;
  }, [importConfig]);

  const getStatusCardCfg = useCallback(async (path: string) => {
    await importConfig();
    const pathConfig = config[path];
    const result = pathConfig && pathConfig.statusCards ? pathConfig.statusCards : { data: [] };
    return result;
  }, [importConfig]);

  const importCommonProperties = useCallback(async (property?: string) => {
    const cfg = await importConfig();
    if (property && cfg['commonProperties'] && cfg['commonProperties'][property]) {
      return cfg['commonProperties'][property];
    }
    return cfg['commonProperties'] || {};
  }, [importConfig]);

  const importRCXIgnoreFields = useCallback(async () => {
    const cfg = await importConfig();
    return cfg['rcxIgnoreFields'] || {};
  }, [importConfig]);

  const getRoutePermission = useCallback(async () => {
    const cfg = await importConfig();
    return cfg['routePermission'];
  }, [importConfig]);

  return {
    importConfig,
    getListViewConfig,
    getGridViewConfig,
    getFormViewConfig,
    getDialogConfig,
    getStatusCardCfg,
    importCommonProperties,
    importRCXIgnoreFields,
    getRoutePermission,
  };
};