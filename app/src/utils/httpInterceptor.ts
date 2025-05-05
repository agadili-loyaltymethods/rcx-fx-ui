// import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAppConfig } from '@/services/configService';
import axios from 'axios';
type AxiosInstance = ReturnType<typeof axios.create>;
// type AxiosRequestConfig = Parameters<typeof axios.request>[0];
// type AxiosResponse = ReturnType<typeof axios.get>;

const { config } = getAppConfig() || {};

export class HttpInterceptor {
  private static instance: AxiosInstance;
  private static pendingRequests = 0;

  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: config?.REST_URL,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      this.setupInterceptors();
    }
    return this.instance;
  }

  private static setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: any) => {
        this.pendingRequests++;
        if (this.pendingRequests === 1) {
          // Trigger loading state
          document.dispatchEvent(new CustomEvent('loading:start'));
        }

        const token = localStorage.getItem('token');
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          };
        }

        // Add default params
        config.params = {
          ...config.params,
          locale: 'en',
          offset: -new Date().getTimezoneOffset()
        };

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response: any) => {
        this.handleRequestCompletion();
        return response;
      },
      (error) => {
        this.handleRequestCompletion();
        this.handleError(error);
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private static handleRequestCompletion() {
    this.pendingRequests--;
    if (this.pendingRequests === 0) {
      // Trigger loading state
      document.dispatchEvent(new CustomEvent('loading:end'));
      sessionStorage.setItem('lastAPIAccess', new Date().toISOString());
    }
  }

  private static handleError(error: any) {
    if (error.response?.data?.code === 1005 ||
        error.response?.data?.code === 1008 ||
        error.response?.data?.code === 1009 ||
        error.response?.data?.code === 1010) {
      // Dispatch error event
      document.dispatchEvent(new CustomEvent('auth:error', {
        detail: { message: error.response.data.message }
      }));
    }
  }

  private static transformError(error: any) {
    const transformedError = {
      httpStatusCode: error.response?.status,
      httpStatusText: error.response?.statusText,
      url: error.config?.url,
      errorMessage: '',
      errorCode: 0,
      errors: null
    };

    if (error.response?.data) {
      const data = error.response.data;
      if (Array.isArray(data)) {
        transformedError.errorMessage = data[0].message;
        transformedError.errorCode = data[0].code;
        transformedError.errors = data[0].code === 1504 ? data[0].errors : null;
      } else {
        transformedError.errorMessage = data.message || (data.errors?.[0]?.message);
        transformedError.errorCode = data.code || (data.errors?.[0]?.code);
        transformedError.errors = data.errors;
      }
    }

    if (error.response?.status === 0) {
      transformedError.errorMessage = 'Network error: Looks like you have an unstable network at the moment, please try again when network stabilizes';
      transformedError.errorCode = 0;
    }

    return transformedError;
  }
}