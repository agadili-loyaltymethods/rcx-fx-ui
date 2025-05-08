import { useCallback } from 'react';
import axiosInstance from '../http/axiosInstance';

export const useRunHistories = () => {
  const getRunHistories = useCallback(async (params: any) => {
    const response = await axiosInstance.get('runhistories', { params });
    return response.data;
  }, []);

  const downloadFile = useCallback(async (body: any) => {
    const response = await axiosInstance.post('downloadfile', body);
    return response.data;
  }, []);

  const getLogFile = useCallback(async (params: any) => {
    const url = `integrations/${params.integrationId}/${params.runId}/log`;
    const response = await axiosInstance.get(url);
    return response.data;
  }, []);

  return {
    getRunHistories,
    downloadFile,
    getLogFile,
  };
};