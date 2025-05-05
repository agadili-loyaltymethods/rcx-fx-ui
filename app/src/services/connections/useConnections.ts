import { useCallback } from 'react';
import axiosInstance from '../http/axiosInstance';

export const useConnections = () => {
  const getConnections = useCallback(async (type: string, params: any) => {
    const response = await axiosInstance.get(`${type}connections`, { params });
    return response.data;
  }, []);

  const postConnections = useCallback(async (params: any, isEdit: boolean, data: any) => {
    const connectionType = data.connectionType === 'S3' ? 's3connections' : 'sftpconnections';
    let url = connectionType;

    if (isEdit) {
      url = `${url}/${data._id}`;
      const response = await axiosInstance.patch(url, params);
      return response.data;
    }

    const response = await axiosInstance.post(url, params);
    return response.data;
  }, []);

  const deleteConnections = useCallback(async (params: any) => {
    const connectionType = params.connectionType === 'S3' ? 's3connections' : 'sftpconnections';
    const url = `${connectionType}/${params._id}`;
    const response = await axiosInstance.delete(url);
    return response.data;
  }, []);

  const connectionsValidate = useCallback(async (params: any) => {
    const response = await axiosInstance.post('testconnections', params);
    return response.data;
  }, []);

  return {
    getConnections,
    postConnections,
    deleteConnections,
    connectionsValidate,
  };
};