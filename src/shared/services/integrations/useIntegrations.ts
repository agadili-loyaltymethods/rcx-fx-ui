import { useCallback } from 'react';
import axiosInstance from '../http';

export const useIntegrations = () => {
  const getIntegrations = useCallback(async (params: any) => {
    const response = await axiosInstance.get('integrations', { params });
    return response.data;
  }, []);

  const postIntegration = useCallback(async (params: any, isEdit: boolean, appendQuery?: boolean) => {
    let url = 'integrations';
    const query = JSON.stringify({ validation: true });

    if (isEdit) {
      url = `${url}/${params._id}`;
      if (appendQuery) {
        url = `${url}?query=${query}`;
      }
      const response = await axiosInstance.patch(url, params);
      return response.data;
    }

    if (appendQuery) {
      url = `${url}?query=${query}`;
    }
    const response = await axiosInstance.post(url, params);
    return response.data;
  }, []);

  const deleteIntegration = useCallback(async (params: any) => {
    const response = await axiosInstance.delete(`integrations/${params._id}`);
    return response.data;
  }, []);

  const publishIntegration = useCallback(async (id: string) => {
    const response = await axiosInstance.post(`integrations/startpublish/${id}`, {});
    return response.data;
  }, []);

  const getNextRuns = useCallback(async (id: string) => {
    const response = await axiosInstance.get(`integrations/${id}/nextRuns`);
    return response.data;
  }, []);

  const resumeIntegration = useCallback(async (id: string) => {
    const response = await axiosInstance.post(`integrations/resume/${id}`, {});
    return response.data;
  }, []);

  const pauseIntegration = useCallback(async (id: string) => {
    const response = await axiosInstance.post(`integrations/pause/${id}`, {});
    return response.data;
  }, []);

  const cancelIntegration = useCallback(async (params: any, query: string) => {
    const response = await axiosInstance.post(`integrations/unpublish/${params._id}?query=${query}`, {});
    return response.data;
  }, []);

  const getIntegrationStatus = useCallback(async (id: string) => {
    const response = await axiosInstance.post(`integrations/status/${id}`, {});
    return response.data;
  }, []);

  const runOnceIntegration = useCallback(async (id: string) => {
    const response = await axiosInstance.post(`integrations/runonce/${id}`, {});
    return response.data;
  }, []);

  const getRunHistories = useCallback(async (params: any) => {
    const response = await axiosInstance.get('runhistories', { params });
    return response.data;
  }, []);

  return {
    getIntegrations,
    postIntegration,
    deleteIntegration,
    publishIntegration,
    getNextRuns,
    resumeIntegration,
    pauseIntegration,
    cancelIntegration,
    getIntegrationStatus,
    runOnceIntegration,
    getRunHistories,
  };
};