import axios from 'axios';
// import { API_CONFIG, DEFAULT_HEADERS } from '../../config/api.config';
import { useLoaderStore } from '../loader/useLoader';
import { useAlert } from '../alert/useAlert';
import { getAppConfig, loadAppConfig } from '../configService';

let pendingRequests = 0;
await loadAppConfig();
const { config: configValue } = getAppConfig() || {};
const axiosInstance = axios.create({
  baseURL: configValue?.REST_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
});

axiosInstance.interceptors.request.use(
  (config: any) => {
    pendingRequests++;
    if (pendingRequests === 1) {
      useLoaderStore.getState().setIsLoading(true);
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.params = {
      ...config.params,
      locale: 'en',
      offset: String(-new Date().getTimezoneOffset()),
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    pendingRequests--;
    if (pendingRequests === 0) {
      useLoaderStore.getState().setIsLoading(false);
      const lastAPIAccess = new Date().toISOString();
      sessionStorage.setItem('lastAPIAccess', lastAPIAccess);
    }
    return response;
  },
  (error) => {
    pendingRequests--;
    if (pendingRequests === 0) {
      useLoaderStore.getState().setIsLoading(false);
      const lastAPIAccess = new Date().toISOString();
      sessionStorage.setItem('lastAPIAccess', lastAPIAccess);
    }

    const errorResponse = error.response?.data;
    if (errorResponse) {
      const errorCodes = [1005, 1008, 1009, 1010];
      if (errorCodes.includes(errorResponse.code)) {
        const alert = useAlert();
        alert.errorAlert(errorResponse.message);
        // Handle logout
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;